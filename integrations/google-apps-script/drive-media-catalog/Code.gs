const DRIVE_MEDIA_CONFIG = Object.freeze({
  mediaFolderId: "18SAnq0Bb9ghlt2mG0jPKkSmh0hw7qvAT",
  resumeFolderId: "1QPNa-acEV1iYMgwe7hpa9Ma0AMdgDIHv",
  siteOrigin: "https://jeromebalangue.github.io",
  responseSource: "jerome-portfolio-drive-media-catalog",
  catalogCacheKey: "jerome-portfolio-drive-media-v1",
  catalogCacheSeconds: 60,
  categoryFolderPattern: /^--(.+?)--$/,
  imageMimePattern: /^image\//,
  videoMimePattern: /^video\//,
  categoryPriority: Object.freeze({
    "app-promotional-video": 0,
    "trend-editing": 1,
    "editing-project": 2
  })
});

function doGet(event) {
  const nonce = getRequestNonce_(event);

  try {
    const refreshRequested = Boolean(event && event.parameter && event.parameter.refresh === "1");
    return createCatalogResponse_(buildMediaCatalog_(refreshRequested), nonce);
  } catch (error) {
    return createCatalogResponse_({
      version: 1,
      ok: false,
      source: "google-drive",
      generatedAt: new Date().toISOString(),
      error: "catalog-unavailable",
      message: String(error && error.message ? error.message : error)
    }, nonce);
  }
}

function testMediaCatalog() {
  const catalog = buildMediaCatalog_(true);
  return {
    ok: catalog.ok,
    assetCount: Object.keys(catalog.assets).length,
    socialCategoryCount: catalog.galleries.social.categories.length,
    socialImageCount: catalog.galleries.social.imageCount,
    aiImageCount: catalog.galleries.ai.imageCount,
    videoCategoryCount: catalog.galleries.video.categories.length,
    videoCount: catalog.galleries.video.videoCount,
    resumeFile: catalog.resume ? catalog.resume.file : ""
  };
}

function clearMediaCatalogCache() {
  CacheService.getScriptCache().remove(DRIVE_MEDIA_CONFIG.catalogCacheKey);
}

function buildMediaCatalog_(forceRefresh) {
  const cache = CacheService.getScriptCache();
  if (!forceRefresh) {
    const cached = cache.get(DRIVE_MEDIA_CONFIG.catalogCacheKey);
    if (cached) return JSON.parse(cached);
  }

  const mediaFolder = Drive.Files.get(DRIVE_MEDIA_CONFIG.mediaFolderId, {
    fields: "id,name,mimeType"
  });
  const imagesFolder = requireChildFolder_(mediaFolder, "images");
  const videosFolder = requireChildFolder_(mediaFolder, "videos");
  const socialFolder = requireChildFolder_(imagesFolder, "social-media-designs");
  const aiFolder = requireChildFolder_(imagesFolder, "AI_generated_design");
  const resume = buildResumeEntry_();
  const assets = {};

  collectAssets_(imagesFolder, "images", assets, DRIVE_MEDIA_CONFIG.imageMimePattern);
  collectAssets_(videosFolder, "videos", assets, DRIVE_MEDIA_CONFIG.videoMimePattern);

  const catalog = {
    version: 1,
    ok: true,
    source: "google-drive",
    generatedAt: new Date().toISOString(),
    cacheSeconds: DRIVE_MEDIA_CONFIG.catalogCacheSeconds,
    resume,
    assets,
    galleries: {
      social: buildCategorizedGallery_(socialFolder, "images"),
      ai: buildAiGallery_(aiFolder),
      video: buildCategorizedGallery_(videosFolder, "videos")
    }
  };

  const serialized = JSON.stringify(catalog);
  if (serialized.length < 95000) {
    cache.put(
      DRIVE_MEDIA_CONFIG.catalogCacheKey,
      serialized,
      DRIVE_MEDIA_CONFIG.catalogCacheSeconds
    );
  }

  return catalog;
}

function buildResumeEntry_() {
  const resumeFolder = Drive.Files.get(DRIVE_MEDIA_CONFIG.resumeFolderId, {
    fields: "id,name,mimeType"
  });
  const resumeFile = listChildren_(resumeFolder.id).find(function (entry) {
    return entry.mimeType === "application/pdf";
  });
  if (!resumeFile) return null;

  return {
    id: resumeFile.id,
    file: resumeFile.name,
    mimeType: resumeFile.mimeType,
    updatedAt: resumeFile.modifiedTime || ""
  };
}

function collectAssets_(folder, relativePath, assets, mimePattern) {
  listFiles_(folder, mimePattern).forEach(function (file) {
    const assetPath = relativePath + "/" + file.name;
    assets[assetPath] = fileEntry_(file);
  });

  listFolders_(folder).forEach(function (childFolder) {
    collectAssets_(
      childFolder,
      relativePath + "/" + childFolder.name,
      assets,
      mimePattern
    );
  });
}

function buildCategorizedGallery_(galleryFolder, entryKind) {
  const itemKey = entryKind === "videos" ? "videos" : "images";
  const mimePattern = entryKind === "videos"
    ? DRIVE_MEDIA_CONFIG.videoMimePattern
    : DRIVE_MEDIA_CONFIG.imageMimePattern;
  const categories = [];
  const categoryIds = {};

  listFolders_(galleryFolder).forEach(function (categoryFolder) {
    const match = categoryFolder.name.match(DRIVE_MEDIA_CONFIG.categoryFolderPattern);
    if (!match) return;

    const name = match[1].replace(/\s+/g, " ").trim();
    const id = categoryIdFromName_(name);
    if (!id || categoryIds[id]) return;

    const files = listFiles_(categoryFolder, mimePattern);
    if (!files.length) return;
    categoryIds[id] = true;

    const category = {
      id,
      name,
      folder: categoryFolder.name
    };
    category[itemKey] = files.map(function (file) {
      const entry = fileEntry_(file);
      if (itemKey === "videos") {
        entry.title = labelFromFilename_(file.name);
      } else {
        entry.alt = labelFromFilename_(file.name);
      }
      return entry;
    });
    categories.push(category);
  });

  if (entryKind === "videos") {
    categories.sort(function (left, right) {
      const leftPriority = Object.prototype.hasOwnProperty.call(
        DRIVE_MEDIA_CONFIG.categoryPriority,
        left.id
      ) ? DRIVE_MEDIA_CONFIG.categoryPriority[left.id] : 100;
      const rightPriority = Object.prototype.hasOwnProperty.call(
        DRIVE_MEDIA_CONFIG.categoryPriority,
        right.id
      ) ? DRIVE_MEDIA_CONFIG.categoryPriority[right.id] : 100;
      return leftPriority - rightPriority || compareNames_(left.name, right.name);
    });
  }

  const countKey = entryKind === "videos" ? "videoCount" : "imageCount";
  const manifest = {
    version: 1,
    folderPattern: "--Category Name--",
    categories
  };
  manifest[countKey] = categories.reduce(function (total, category) {
    return total + category[itemKey].length;
  }, 0);
  return manifest;
}

function buildAiGallery_(aiFolder) {
  const images = listFiles_(aiFolder, DRIVE_MEDIA_CONFIG.imageMimePattern).map(function (file) {
    const entry = fileEntry_(file);
    entry.alt = labelFromFilename_(file.name);
    return entry;
  });

  return {
    version: 1,
    imageCount: images.length,
    images
  };
}

function fileEntry_(file) {
  const id = file.id;
  const mimeType = file.mimeType;
  const isVideo = DRIVE_MEDIA_CONFIG.videoMimePattern.test(mimeType);

  return {
    id,
    file: file.name,
    mimeType,
    updatedAt: file.modifiedTime || "",
    src: isVideo ? videoUrl_(id) : imageUrl_(id),
    original: originalMediaUrl_(id)
  };
}

function imageUrl_(fileId) {
  return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(fileId) + "&sz=w4096";
}

function videoUrl_(fileId) {
  return originalMediaUrl_(fileId);
}

function originalMediaUrl_(fileId) {
  return "https://drive.usercontent.google.com/download?id="
    + encodeURIComponent(fileId)
    + "&export=download&authuser=0&confirm=t";
}

function listFolders_(folder) {
  return listChildren_(folder.id).filter(function (entry) {
    return entry.mimeType === "application/vnd.google-apps.folder";
  });
}

function listFiles_(folder, mimePattern) {
  return listChildren_(folder.id).filter(function (entry) {
    return entry.mimeType !== "application/vnd.google-apps.folder"
      && mimePattern.test(entry.mimeType);
  });
}

function requireChildFolder_(parentFolder, name) {
  const folder = listFolders_(parentFolder).find(function (entry) {
    return entry.name === name;
  });
  if (!folder) {
    throw new Error("Required Drive folder is missing: " + name);
  }
  return folder;
}

function listChildren_(folderId) {
  const children = [];
  let pageToken = null;

  do {
    const response = Drive.Files.list({
      q: "'" + folderId.replace(/'/g, "\\'") + "' in parents and trashed = false",
      fields: "nextPageToken,files(id,name,mimeType,modifiedTime)",
      orderBy: "name_natural",
      pageSize: 1000,
      pageToken: pageToken || undefined
    });
    Array.prototype.push.apply(children, response.files || []);
    pageToken = response.nextPageToken || null;
  } while (pageToken);

  return children.sort(function (left, right) {
    return compareNames_(left.name, right.name);
  });
}

function categoryIdFromName_(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function labelFromFilename_(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, function (character) {
      return character.toUpperCase();
    })
    .replace(/\b12kw\b/gi, "12kW");
}

function compareNames_(left, right) {
  return left.localeCompare(right, "en", {
    numeric: true,
    sensitivity: "base"
  });
}

function getRequestNonce_(event) {
  const nonce = event && event.parameter ? String(event.parameter.nonce || "") : "";
  return /^[A-Za-z0-9_-]{12,160}$/.test(nonce) ? nonce : "";
}

function createCatalogResponse_(payload, nonce) {
  const message = JSON.stringify({
    source: DRIVE_MEDIA_CONFIG.responseSource,
    nonce: nonce,
    catalog: payload
  })
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  const targetOrigin = JSON.stringify(DRIVE_MEDIA_CONFIG.siteOrigin);
  const html = "<!doctype html><meta charset=\"utf-8\"><script>"
    + "window.top.postMessage(" + message + "," + targetOrigin + ");"
    + "</" + "script>";

  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
