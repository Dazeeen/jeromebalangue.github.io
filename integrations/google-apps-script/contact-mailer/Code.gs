const CONTACT_CONFIG = Object.freeze({
  destinationEmail: "balanguejerome@gmail.com",
  allowedOrigin: "https://jeromebalangue.github.io",
  responseSource: "jerome-portfolio-contact-mailer",
  senderName: "Jerome Balangue Portfolio",
  siteUrl: "https://jeromebalangue.github.io/",
  webAppUrl: "https://script.google.com/macros/s/AKfycbyKnUg4T1HiVJ3rxeiXGq5hjhtrZvLxFZaZj642kG7YiMdyCUyy6YFeSoxdkJww3HPQMg/exec",
  moderationGatewayUrl: "https://jeromebalangue.github.io/review-moderation.html?v=5",
  moderationEnabled: false,
  moderationTokenLifetimeSeconds: 24 * 60 * 60,
  curtainImageUrl: "https://drive.google.com/thumbnail?id=1Ot_dZXQnqWO_bNbGQE6gdhXietuIP2UV&sz=w4096",
  profileImageUrl: "https://drive.google.com/thumbnail?id=1JDN_LOQexli7mBBp2bNqW_e4lUMz6m3m&sz=w4096",
  rateLimitSeconds: 60,
  maxNameLength: 100,
  maxEmailLength: 254,
  maxMessageLength: 5000,
  maxAttachments: 10,
  maxAttachmentBytes: 5 * 1024 * 1024,
  maxTotalAttachmentBytes: 20 * 1024 * 1024,
  maxUncompressedAttachmentBytes: 25 * 1024 * 1024,
  reviewRateLimitSeconds: 300,
  maxReviewCompanyLength: 120,
  maxReviewTitleLength: 120,
  maxReviewFeedbackLength: 1200,
  maxStoredReviews: 5000,
  portfolioFolderName: "Website Portfolio",
  inquiriesFolderName: "Inquiries",
  reviewsFolderName: "Reviews",
  reviewsSpreadsheetName: "Portfolio Reviews",
  reviewsSheetName: "Reviews",
  portfolioFolderIdKey: "storage:portfolioFolderId",
  inquiriesFolderIdKey: "storage:inquiriesFolderId",
  reviewsFolderIdKey: "storage:reviewsFolderId",
  reviewsSpreadsheetIdKey: "storage:reviewsSpreadsheetId",
  reviewMigrationKey: "reviews:migratedToSheet",
  reviewIndexKey: "reviews:index",
  reviewPropertyPrefix: "review:"
});

const REVIEW_SHEET_HEADERS = Object.freeze([
  "Review ID",
  "Submitted At",
  "Name",
  "Email",
  "Company",
  "Title",
  "Rating",
  "Review",
  "Status",
  "Approved At",
  "Token Hash",
  "Token Expires At"
]);

const CONTACT_DOCUMENT_TYPES = Object.freeze({
  pdf: Object.freeze({ mimeType: "application/pdf", kind: "pdf" }),
  docx: Object.freeze({
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    kind: "zip",
    requiredEntries: Object.freeze(["[Content_Types].xml", "word/document.xml"])
  }),
  xlsx: Object.freeze({
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    kind: "zip",
    requiredEntries: Object.freeze(["[Content_Types].xml", "xl/workbook.xml"])
  }),
  pptx: Object.freeze({
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    kind: "zip",
    requiredEntries: Object.freeze(["[Content_Types].xml", "ppt/presentation.xml"])
  }),
  odt: Object.freeze({
    mimeType: "application/vnd.oasis.opendocument.text",
    kind: "zip",
    requiredEntries: Object.freeze(["mimetype", "content.xml"])
  }),
  ods: Object.freeze({
    mimeType: "application/vnd.oasis.opendocument.spreadsheet",
    kind: "zip",
    requiredEntries: Object.freeze(["mimetype", "content.xml"])
  }),
  odp: Object.freeze({
    mimeType: "application/vnd.oasis.opendocument.presentation",
    kind: "zip",
    requiredEntries: Object.freeze(["mimetype", "content.xml"])
  }),
  rtf: Object.freeze({ mimeType: "application/rtf", kind: "rtf" }),
  txt: Object.freeze({ mimeType: "text/plain", kind: "text" }),
  csv: Object.freeze({ mimeType: "text/csv", kind: "text" })
});

function doGet(event) {
  const request = readRequest_(event);
  if (String(request.mode || "").toLowerCase() === "reviews") {
    return createBrowserResponse_({
      type: "reviews",
      success: true,
      message: "Published reviews are ready.",
      reviewSubmissions: true,
      reviews: getPublishedReviews_()
    });
  }
  if (request.reviewAction) {
    if (!CONTACT_CONFIG.moderationEnabled) {
      return createReviewModerationPage_(
        false,
        "Owner approval required",
        "Review moderation is available only through Jerome's private approval deployment."
      );
    }
    return handleReviewModeration_(request);
  }

  return createBrowserResponse_({
    type: "capabilities",
    success: true,
    message: "The Jerome portfolio contact mailer is ready.",
    documentAttachments: true,
    maxAttachmentBytes: CONTACT_CONFIG.maxAttachmentBytes,
    maxAttachments: CONTACT_CONFIG.maxAttachments,
    maxTotalAttachmentBytes: CONTACT_CONFIG.maxTotalAttachmentBytes,
    reviewSubmissions: true,
    portfolioStorage: true
  });
}

function doPost(event) {
  try {
    const request = readRequest_(event);
    if (String(request.submissionType || "").toLowerCase() === "review") {
      return handleReviewSubmission_(request);
    }

    // Silently accept bot-filled honeypots without sending an email.
    if (cleanText_(request._honey, 200)) {
      return createBrowserResponse_({
        success: true,
        message: "Your message was submitted successfully."
      });
    }

    const name = cleanText_(request.name, CONTACT_CONFIG.maxNameLength);
    const email = cleanText_(request.email, CONTACT_CONFIG.maxEmailLength).toLowerCase();
    const message = cleanText_(request.message, CONTACT_CONFIG.maxMessageLength);

    if (!name || !isValidEmail_(email) || !message) {
      return createBrowserResponse_({
        success: false,
        message: "Please provide a valid name, email address, and project message."
      });
    }

    enforceRateLimit_(email);

    if (MailApp.getRemainingDailyQuota() < 1) {
      throw new Error("DAILY_QUOTA_REACHED");
    }

    const attachments = createDocumentAttachments_(request);

    const submittedAtDate = new Date();
    const submittedAt = Utilities.formatDate(
      submittedAtDate,
      "Asia/Manila",
      "MMMM d, yyyy 'at' h:mm a"
    );
    const subject = `New portfolio inquiry from ${name}`;
    const attachmentInfos = attachments.map(function (attachment) {
      return {
        name: attachment.name,
        sizeBytes: attachment.sizeBytes
      };
    });

    const plainTextEmail = createPlainTextEmail_(name, email, message, submittedAt, attachmentInfos);
    const htmlEmail = createHtmlEmail_(name, email, message, submittedAt, attachmentInfos);

    storeInquiryInDrive_(
      name,
      submittedAtDate,
      attachments,
      plainTextEmail,
      htmlEmail
    );

    const emailOptions = {
      to: CONTACT_CONFIG.destinationEmail,
      subject,
      name: CONTACT_CONFIG.senderName,
      replyTo: email,
      body: plainTextEmail,
      htmlBody: htmlEmail
    };
    if (attachments.length) {
      emailOptions.attachments = attachments.map(function (attachment) {
        return attachment.blob;
      });
    }

    MailApp.sendEmail(emailOptions);

    return createBrowserResponse_({
      success: true,
      message: "Thank you! Your message was sent to Jerome."
    });
  } catch (error) {
    console.error(error);
    const errorMessages = {
      RATE_LIMITED: "Please wait a minute before sending another message.",
      ATTACHMENT_TOO_LARGE: "Please attach a document no larger than 5 MB.",
      TOO_MANY_ATTACHMENTS: "Please attach no more than 10 documents.",
      ATTACHMENTS_TOO_LARGE: "Please keep the combined document size at or below 20 MB.",
      UNSUPPORTED_ATTACHMENT: "Only PDF, DOCX, XLSX, PPTX, ODT, ODS, ODP, RTF, TXT, or CSV documents are allowed.",
      INVALID_ATTACHMENT: "The attached file could not be verified as a safe document.",
      STORAGE_UNAVAILABLE: "Your inquiry could not be saved securely. Please try again later."
    };
    return createBrowserResponse_({
      success: false,
      message: errorMessages[error && error.message]
        || "The email service is temporarily unavailable. Please try again later."
    });
  }
}

function readRequest_(event) {
  if (!event) return {};

  const contentType = String(event.postData && event.postData.type || "").toLowerCase();
  if (contentType.indexOf("application/json") !== -1) {
    try {
      return JSON.parse(event.postData.contents || "{}");
    } catch (error) {
      return {};
    }
  }

  return event.parameter || {};
}

function cleanText_(value, maxLength) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function cleanSingleLine_(value, maxLength) {
  return cleanText_(value, maxLength).replace(/\s+/g, " ");
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function enforceRateLimit_(email) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    email,
    Utilities.Charset.UTF_8
  );
  const key = "contact:" + digest.map(function (byte) {
    return (byte + 256).toString(16).slice(-2);
  }).join("");
  const cache = CacheService.getScriptCache();

  if (cache.get(key)) throw new Error("RATE_LIMITED");
  cache.put(key, "1", CONTACT_CONFIG.rateLimitSeconds);
}

function handleReviewSubmission_(request) {
  try {
    if (cleanText_(request.reviewWebsite, 200)) {
      return createBrowserResponse_({
        type: "review-result",
        success: true,
        message: "Thank you! Your review was submitted for approval.",
        reviewSubmissions: true
      });
    }

    const name = cleanSingleLine_(request.reviewName, CONTACT_CONFIG.maxNameLength);
    const email = cleanText_(request.reviewEmail, CONTACT_CONFIG.maxEmailLength).toLowerCase();
    const company = cleanSingleLine_(request.reviewCompany, CONTACT_CONFIG.maxReviewCompanyLength);
    const title = cleanSingleLine_(request.reviewTitle, CONTACT_CONFIG.maxReviewTitleLength);
    const feedback = cleanText_(request.reviewFeedback, CONTACT_CONFIG.maxReviewFeedbackLength);
    const rating = Number(request.reviewRating);
    const consent = String(request.reviewConsent || "").toLowerCase() === "yes";

    if (
      !name
      || !isValidEmail_(email)
      || !title
      || !feedback
      || !Number.isInteger(rating)
      || rating < 1
      || rating > 5
      || !consent
    ) {
      throw new Error("INVALID_REVIEW");
    }

    enforceReviewRateLimit_(email);
    if (MailApp.getRemainingDailyQuota() < 1) throw new Error("DAILY_QUOTA_REACHED");

    const submittedAtDate = new Date();
    const moderationToken = createReviewModerationToken_();
    const review = {
      id: Utilities.getUuid().replace(/-/g, ""),
      name,
      email,
      company,
      title,
      rating,
      feedback,
      status: "pending",
      createdAt: submittedAtDate.toISOString(),
      approvedAt: ""
    };
    review.tokenHash = hashReviewModerationToken_(review.id, moderationToken);
    review.tokenExpiresAt = createReviewModerationExpiry_();

    storePendingReview_(review);
    try {
      sendReviewModerationEmail_(review, moderationToken, submittedAtDate);
    } catch (error) {
      deleteReviewRecord_(review.id);
      throw error;
    }

    return createBrowserResponse_({
      type: "review-result",
      success: true,
      message: "Thank you! Your review was sent to Jerome for approval.",
      reviewSubmissions: true
    });
  } catch (error) {
    console.error(error);
    const errorMessages = {
      INVALID_REVIEW: "Please complete every required review field and choose a rating.",
      REVIEW_RATE_LIMITED: "Please wait five minutes before submitting another review.",
      REVIEW_STORAGE_FULL: "Review submission is temporarily full. Please contact Jerome directly.",
      DAILY_QUOTA_REACHED: "The review notification service has reached today's email limit. Please try again tomorrow.",
      STORAGE_UNAVAILABLE: "The review could not be saved securely. Please try again later."
    };
    return createBrowserResponse_({
      type: "review-result",
      success: false,
      message: errorMessages[error && error.message]
        || "The review service is temporarily unavailable. Please try again later.",
      reviewSubmissions: true
    });
  }
}

function enforceReviewRateLimit_(email) {
  const key = "review:" + sha256Hex_(email);
  const cache = CacheService.getScriptCache();
  if (cache.get(key)) throw new Error("REVIEW_RATE_LIMITED");
  cache.put(key, "1", CONTACT_CONFIG.reviewRateLimitSeconds);
}

function createReviewModerationToken_() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, "");
}

function createReviewModerationExpiry_() {
  return new Date(Date.now() + CONTACT_CONFIG.moderationTokenLifetimeSeconds * 1000).toISOString();
}

function sha256Hex_(value) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  ).map(function (byte) {
    return (byte + 256).toString(16).slice(-2);
  }).join("");
}

function hashReviewModerationToken_(reviewId, token) {
  return sha256Hex_("review-moderation:" + reviewId + ":" + token);
}

function secureStringsEqual_(left, right) {
  const first = String(left || "");
  const second = String(right || "");
  let mismatch = first.length ^ second.length;
  const maximumLength = Math.max(first.length, second.length);
  for (let index = 0; index < maximumLength; index += 1) {
    mismatch |= (first.charCodeAt(index) || 0) ^ (second.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function getStorageProperties_() {
  return PropertiesService.getScriptProperties();
}

function getLegacyReviewIndex_(properties) {
  const rawIndex = properties.getProperty(CONTACT_CONFIG.reviewIndexKey);
  if (!rawIndex) return [];

  let parsedIndex;
  try {
    parsedIndex = JSON.parse(rawIndex);
  } catch (error) {
    return [];
  }
  if (!Array.isArray(parsedIndex)) return [];

  const seen = {};
  return parsedIndex.filter(function (reviewId) {
    const safeId = String(reviewId || "");
    if (!/^[a-f0-9]{32}$/i.test(safeId) || seen[safeId]) return false;
    seen[safeId] = true;
    return true;
  });
}

function getLegacyReviewRecord_(properties, reviewId) {
  const rawReview = properties.getProperty(CONTACT_CONFIG.reviewPropertyPrefix + reviewId);
  if (!rawReview) return null;
  try {
    const review = JSON.parse(rawReview);
    return review && typeof review === "object" && !Array.isArray(review) ? review : null;
  } catch (error) {
    return null;
  }
}

function getFolderByCachedId_(properties, propertyKey) {
  const folderId = properties.getProperty(propertyKey);
  if (!folderId) return null;
  try {
    return DriveApp.getFolderById(folderId);
  } catch (error) {
    properties.deleteProperty(propertyKey);
    return null;
  }
}

function getOrCreateChildFolder_(properties, propertyKey, parentFolder, folderName) {
  const cachedFolder = getFolderByCachedId_(properties, propertyKey);
  if (cachedFolder) return cachedFolder;

  const matchingFolders = parentFolder.getFoldersByName(folderName);
  const folder = matchingFolders.hasNext()
    ? matchingFolders.next()
    : parentFolder.createFolder(folderName);
  properties.setProperty(propertyKey, folder.getId());
  return folder;
}

function getOrCreateReviewSpreadsheet_(properties, reviewsFolder) {
  const cachedSpreadsheetId = properties.getProperty(CONTACT_CONFIG.reviewsSpreadsheetIdKey);
  if (cachedSpreadsheetId) {
    try {
      return SpreadsheetApp.openById(cachedSpreadsheetId);
    } catch (error) {
      properties.deleteProperty(CONTACT_CONFIG.reviewsSpreadsheetIdKey);
    }
  }

  const matchingFiles = reviewsFolder.getFilesByName(CONTACT_CONFIG.reviewsSpreadsheetName);
  while (matchingFiles.hasNext()) {
    const file = matchingFiles.next();
    try {
      const spreadsheet = SpreadsheetApp.open(file);
      properties.setProperty(CONTACT_CONFIG.reviewsSpreadsheetIdKey, spreadsheet.getId());
      return spreadsheet;
    } catch (error) {
      // Ignore a non-Sheets file that happens to have the same name.
    }
  }

  const spreadsheet = SpreadsheetApp.create(CONTACT_CONFIG.reviewsSpreadsheetName);
  DriveApp.getFileById(spreadsheet.getId()).moveTo(reviewsFolder);
  properties.setProperty(CONTACT_CONFIG.reviewsSpreadsheetIdKey, spreadsheet.getId());
  return spreadsheet;
}

function initializeReviewSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(CONTACT_CONFIG.reviewsSheetName);
  if (!sheet) {
    sheet = spreadsheet.getSheets()[0];
    sheet.setName(CONTACT_CONFIG.reviewsSheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, REVIEW_SHEET_HEADERS.length).setValues([REVIEW_SHEET_HEADERS]);
    sheet.setFrozenRows(1);
  } else {
    const headers = sheet.getRange(1, 1, 1, REVIEW_SHEET_HEADERS.length).getValues()[0];
    const legacyHeaders = REVIEW_SHEET_HEADERS.slice(0, -1);
    const validLegacyHeaders = legacyHeaders.every(function (header, index) {
      return String(headers[index] || "") === header;
    });
    if (validLegacyHeaders && !String(headers[REVIEW_SHEET_HEADERS.length - 1] || "")) {
      sheet.getRange(1, REVIEW_SHEET_HEADERS.length, 1, 1)
        .setValues([[REVIEW_SHEET_HEADERS[REVIEW_SHEET_HEADERS.length - 1]]]);
      headers[REVIEW_SHEET_HEADERS.length - 1] = REVIEW_SHEET_HEADERS[REVIEW_SHEET_HEADERS.length - 1];
    }
    const validHeaders = REVIEW_SHEET_HEADERS.every(function (header, index) {
      return String(headers[index] || "") === header;
    });
    if (!validHeaders) throw new Error("STORAGE_UNAVAILABLE");
  }
  return sheet;
}

function ensurePortfolioStorageUnlocked_() {
  const properties = getStorageProperties_();
  const portfolioFolder = getOrCreateChildFolder_(
    properties,
    CONTACT_CONFIG.portfolioFolderIdKey,
    DriveApp.getRootFolder(),
    CONTACT_CONFIG.portfolioFolderName
  );
  const inquiriesFolder = getOrCreateChildFolder_(
    properties,
    CONTACT_CONFIG.inquiriesFolderIdKey,
    portfolioFolder,
    CONTACT_CONFIG.inquiriesFolderName
  );
  const reviewsFolder = getOrCreateChildFolder_(
    properties,
    CONTACT_CONFIG.reviewsFolderIdKey,
    portfolioFolder,
    CONTACT_CONFIG.reviewsFolderName
  );
  const reviewSpreadsheet = getOrCreateReviewSpreadsheet_(properties, reviewsFolder);
  const reviewSheet = initializeReviewSheet_(reviewSpreadsheet);
  migrateLegacyReviewsToSheetUnlocked_(properties, reviewSheet);

  return {
    portfolioFolder,
    inquiriesFolder,
    reviewsFolder,
    reviewSpreadsheet,
    reviewSheet
  };
}

function setupPortfolioStorage() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = ensurePortfolioStorageUnlocked_();
    return {
      portfolioFolderId: storage.portfolioFolder.getId(),
      portfolioFolderUrl: storage.portfolioFolder.getUrl(),
      inquiriesFolderId: storage.inquiriesFolder.getId(),
      inquiriesFolderUrl: storage.inquiriesFolder.getUrl(),
      reviewsFolderId: storage.reviewsFolder.getId(),
      reviewsFolderUrl: storage.reviewsFolder.getUrl(),
      reviewsSpreadsheetId: storage.reviewSpreadsheet.getId(),
      reviewsSpreadsheetUrl: storage.reviewSpreadsheet.getUrl()
    };
  } finally {
    lock.releaseLock();
  }
}

function cleanDriveFolderName_(value) {
  return cleanSingleLine_(value, 80)
    .replace(/[\\/]/g, "-")
    .replace(/[<>:"|?*]/g, "")
    .trim() || "Potential Client";
}

function storeInquiryInDrive_(name, submittedAtDate, attachments, plainTextEmail, htmlEmail) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = ensurePortfolioStorageUnlocked_();
    const clientFolderName = cleanDriveFolderName_(name);
    const clientFolders = storage.inquiriesFolder.getFoldersByName(clientFolderName);
    const clientFolder = clientFolders.hasNext()
      ? clientFolders.next()
      : storage.inquiriesFolder.createFolder(clientFolderName);
    const storageTimestamp = Utilities.formatDate(
      submittedAtDate,
      "Asia/Manila",
      "yyyy-MM-dd HH-mm-ss"
    );
    const recordBaseName = "Inquiry - " + storageTimestamp;

    clientFolder.createFile(recordBaseName + ".txt", plainTextEmail, MimeType.PLAIN_TEXT);
    clientFolder.createFile(recordBaseName + ".html", htmlEmail, MimeType.HTML);
    attachments.forEach(function (attachment) {
      clientFolder.createFile(attachment.blob.copyBlob().setName(attachment.name));
    });

    return {
      clientFolderId: clientFolder.getId(),
      clientFolderUrl: clientFolder.getUrl()
    };
  } catch (error) {
    if (error && [
      "ATTACHMENT_TOO_LARGE",
      "TOO_MANY_ATTACHMENTS",
      "ATTACHMENTS_TOO_LARGE",
      "UNSUPPORTED_ATTACHMENT",
      "INVALID_ATTACHMENT"
    ].indexOf(error.message) !== -1) throw error;
    throw new Error("STORAGE_UNAVAILABLE");
  } finally {
    lock.releaseLock();
  }
}

function toSheetText_(value) {
  const text = String(value == null ? "" : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function fromSheetText_(value) {
  const text = String(value == null ? "" : value);
  return /^'[=+\-@]/.test(text) ? text.slice(1) : text;
}

function normalizeSheetDate_(value) {
  if (value && Object.prototype.toString.call(value) === "[object Date]") {
    return value.toISOString();
  }
  return String(value || "");
}

function reviewToSheetRow_(review) {
  return [
    review.id,
    review.createdAt,
    toSheetText_(review.name),
    review.email,
    toSheetText_(review.company),
    toSheetText_(review.title),
    review.rating,
    toSheetText_(review.feedback),
    review.status,
    review.approvedAt || "",
    review.tokenHash || "",
    review.tokenExpiresAt || ""
  ];
}

function sheetRowToReview_(row) {
  return {
    id: String(row[0] || ""),
    createdAt: normalizeSheetDate_(row[1]),
    name: fromSheetText_(row[2]),
    email: String(row[3] || ""),
    company: fromSheetText_(row[4]),
    title: fromSheetText_(row[5]),
    rating: Number(row[6]),
    feedback: fromSheetText_(row[7]),
    status: String(row[8] || ""),
    approvedAt: normalizeSheetDate_(row[9]),
    tokenHash: String(row[10] || ""),
    tokenExpiresAt: normalizeSheetDate_(row[11])
  };
}

function getSheetReviewsUnlocked_(sheet) {
  const rowCount = Math.max(0, sheet.getLastRow() - 1);
  if (!rowCount) return [];
  return sheet.getRange(2, 1, rowCount, REVIEW_SHEET_HEADERS.length)
    .getValues()
    .map(sheetRowToReview_);
}

function findReviewRowUnlocked_(sheet, reviewId) {
  const reviews = getSheetReviewsUnlocked_(sheet);
  for (let index = 0; index < reviews.length; index += 1) {
    if (reviews[index].id === reviewId) {
      return { review: reviews[index], rowNumber: index + 2 };
    }
  }
  return null;
}

function appendReviewRowUnlocked_(sheet, review) {
  sheet.appendRow(reviewToSheetRow_(review));
}

function migrateLegacyReviewsToSheetUnlocked_(properties, sheet) {
  if (properties.getProperty(CONTACT_CONFIG.reviewMigrationKey) === "1") return;

  const existingIds = {};
  getSheetReviewsUnlocked_(sheet).forEach(function (review) {
    existingIds[review.id] = true;
  });
  getLegacyReviewIndex_(properties).forEach(function (reviewId) {
    if (existingIds[reviewId]) return;
    const review = getLegacyReviewRecord_(properties, reviewId);
    if (!review) return;
    appendReviewRowUnlocked_(sheet, review);
    existingIds[reviewId] = true;
  });
  properties.setProperty(CONTACT_CONFIG.reviewMigrationKey, "1");
}

function storePendingReview_(review) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = ensurePortfolioStorageUnlocked_();
    if (storage.reviewSheet.getLastRow() - 1 >= CONTACT_CONFIG.maxStoredReviews) {
      throw new Error("REVIEW_STORAGE_FULL");
    }
    appendReviewRowUnlocked_(storage.reviewSheet, review);
  } finally {
    lock.releaseLock();
  }
}

function deleteReviewRecord_(reviewId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = ensurePortfolioStorageUnlocked_();
    const match = findReviewRowUnlocked_(storage.reviewSheet, reviewId);
    if (match) storage.reviewSheet.deleteRow(match.rowNumber);
  } finally {
    lock.releaseLock();
  }
}

function getPublishedReviews_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = ensurePortfolioStorageUnlocked_();
    return getSheetReviewsUnlocked_(storage.reviewSheet).filter(function (review) {
      return review.status === "approved";
    }).sort(function (left, right) {
      return String(right.approvedAt || "").localeCompare(String(left.approvedAt || ""));
    }).map(function (review) {
      return {
        id: review.id,
        name: review.name,
        company: review.company,
        title: review.title,
        rating: review.rating,
        feedback: review.feedback,
        approvedAt: review.approvedAt
      };
    });
  } finally {
    lock.releaseLock();
  }
}

function sendReviewModerationEmail_(review, moderationToken, submittedAtDate) {
  const approveUrl = createReviewModerationUrl_(CONTACT_CONFIG.moderationGatewayUrl, "approve", review.id, moderationToken);
  const rejectUrl = createReviewModerationUrl_(CONTACT_CONFIG.moderationGatewayUrl, "reject", review.id, moderationToken);
  const submittedAt = Utilities.formatDate(
    submittedAtDate,
    "Asia/Manila",
    "MMMM d, yyyy 'at' h:mm a"
  );
  const expiresAtDate = new Date(review.tokenExpiresAt);
  const expiresAt = Utilities.formatDate(
    Number.isNaN(expiresAtDate.getTime()) ? new Date() : expiresAtDate,
    "Asia/Manila",
    "MMMM d, yyyy 'at' h:mm a"
  );

  MailApp.sendEmail({
    to: CONTACT_CONFIG.destinationEmail,
    subject: review.rating + "-star website review from " + review.name + " - approval needed",
    name: CONTACT_CONFIG.senderName,
    replyTo: review.email,
    body: createReviewModerationPlainTextEmail_(review, submittedAt, expiresAt, approveUrl, rejectUrl),
    htmlBody: createReviewModerationHtmlEmail_(review, submittedAt, expiresAt, approveUrl, rejectUrl)
  });
}

function resendPendingReviewModerationEmails() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = ensurePortfolioStorageUnlocked_();
    const pendingReviews = getSheetReviewsUnlocked_(storage.reviewSheet).map(function (review, index) {
      return { review, rowNumber: index + 2 };
    }).filter(function (entry) {
      return entry.review.status === "pending";
    });

    if (MailApp.getRemainingDailyQuota() < pendingReviews.length) {
      throw new Error("DAILY_QUOTA_REACHED");
    }

    pendingReviews.forEach(function (entry) {
      const moderationToken = createReviewModerationToken_();
      const previousTokenHash = entry.review.tokenHash;
      const previousTokenExpiresAt = entry.review.tokenExpiresAt;
      const nextTokenHash = hashReviewModerationToken_(entry.review.id, moderationToken);
      const nextTokenExpiresAt = createReviewModerationExpiry_();
      entry.review.tokenHash = nextTokenHash;
      entry.review.tokenExpiresAt = nextTokenExpiresAt;
      storage.reviewSheet.getRange(entry.rowNumber, 11, 1, 2)
        .setValues([[nextTokenHash, nextTokenExpiresAt]]);
      try {
        const submittedAtDate = new Date(entry.review.createdAt);
        sendReviewModerationEmail_(
          entry.review,
          moderationToken,
          Number.isNaN(submittedAtDate.getTime()) ? new Date() : submittedAtDate
        );
      } catch (error) {
        storage.reviewSheet.getRange(entry.rowNumber, 11, 1, 2)
          .setValues([[previousTokenHash, previousTokenExpiresAt]]);
        throw error;
      }
    });

    return { resent: pendingReviews.length };
  } finally {
    lock.releaseLock();
  }
}

function createReviewModerationUrl_(serviceUrl, action, reviewId, token) {
  return serviceUrl
    + "#reviewAction=" + encodeURIComponent(action)
    + "&reviewId=" + encodeURIComponent(reviewId)
    + "&reviewToken=" + encodeURIComponent(token);
}

function createReviewModerationPlainTextEmail_(review, submittedAt, expiresAt, approveUrl, rejectUrl) {
  return [
    "NEW WEBSITE REVIEW - APPROVAL REQUIRED",
    "",
    "Reviewer: " + review.name,
    "Email: " + review.email,
    "Company: " + (review.company || "Not provided"),
    "Rating: " + review.rating + "/5",
    "Title: " + review.title,
    "Submitted: " + submittedAt + " (Asia/Manila)",
    "Approval link expires: " + expiresAt + " (Asia/Manila)",
    "",
    review.feedback,
    "",
    "ACCEPT AND POST:",
    approveUrl,
    "",
    "DECLINE AND DELETE:",
    rejectUrl,
    "",
    "Each secure link is delivered only to Jerome's email, can be used once, and expires after 24 hours."
  ].join("\n");
}

function createReviewModerationHtmlEmail_(review, submittedAt, expiresAt, approveUrl, rejectUrl) {
  const safeName = escapeHtml_(review.name);
  const safeEmail = escapeHtml_(review.email);
  const safeCompany = escapeHtml_(review.company || "Independent client");
  const safeTitle = escapeHtml_(review.title);
  const safeFeedback = escapeHtml_(review.feedback).replace(/\r?\n/g, "<br>");
  const safeSubmittedAt = escapeHtml_(submittedAt);
  const safeExpiresAt = escapeHtml_(expiresAt);
  const safeApproveUrl = escapeHtml_(approveUrl);
  const safeRejectUrl = escapeHtml_(rejectUrl);
  const stars = new Array(review.rating + 1).join("&#9733; ");
  const curtainImageUrl = CONTACT_CONFIG.curtainImageUrl;

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#02050c;font-family:Arial,Helvetica,sans-serif;color:#edf4ff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safeName} submitted a ${review.rating}-star review for your approval.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" background="${curtainImageUrl}" style="width:100%;padding:32px 12px;background-color:#02050c;background-image:linear-gradient(90deg,rgba(1,5,12,.54),rgba(15,68,166,.3)),url(${curtainImageUrl});background-position:center;background-size:cover;">
    <tr><td align="center">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;border:1px solid #31568e;border-radius:22px;overflow:hidden;background:#f5f8fd;box-shadow:0 22px 60px rgba(0,0,0,.52);">
        <tr><td style="padding:34px 38px;background:#082b68;text-align:center;color:#fff;">
          <div style="font-size:10px;font-weight:800;letter-spacing:2.8px;text-transform:uppercase;color:#9fc2ff;">Jerome Balangue Portfolio</div>
          <h1 style="margin:12px 0 8px;font-size:36px;line-height:1.08;letter-spacing:-1px;">New Website Review</h1>
          <p style="margin:0;color:#d5e5ff;font-size:14px;line-height:1.6;">Preview the submission, then publish it or remove it.</p>
        </td></tr>
        <tr><td style="padding:34px 38px;background:#f5f8fd;color:#10213e;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td>
                <div style="font-size:19px;font-weight:800;color:#0d1c35;">${safeName}</div>
                <div style="margin-top:4px;font-size:12px;color:#61728d;">${safeCompany} &middot; <a href="mailto:${safeEmail}" style="color:#326fd0;">${safeEmail}</a></div>
              </td>
              <td align="right" style="font-size:20px;letter-spacing:2px;color:#ffb915;white-space:nowrap;">${stars}</td>
            </tr>
          </table>
          <div style="margin-top:22px;padding:22px;border:1px solid #cfdaea;border-radius:14px;background:#fff;">
            <div style="font-size:18px;font-weight:800;color:#10213e;">${safeTitle}</div>
            <div style="margin-top:10px;font-size:14px;line-height:1.75;color:#42536e;">${safeFeedback}</div>
          </div>
          <div style="margin-top:14px;font-size:11px;color:#73839b;">Submitted ${safeSubmittedAt} (Asia/Manila)</div>
          <div style="margin-top:5px;font-size:11px;font-weight:700;color:#b32645;">Secure owner approval expires ${safeExpiresAt} (Asia/Manila)</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
            <tr>
              <td width="50%" style="padding-right:6px;"><a href="${safeApproveUrl}" style="display:block;padding:15px 12px;border-radius:999px;background:#155fd7;color:#fff;font-size:11px;font-weight:800;letter-spacing:.7px;text-align:center;text-decoration:none;text-transform:uppercase;">Accept &amp; Post</a></td>
              <td width="50%" style="padding-left:6px;"><a href="${safeRejectUrl}" style="display:block;padding:14px 12px;border:1px solid #d95870;border-radius:999px;background:#fff;color:#b32645;font-size:11px;font-weight:800;letter-spacing:.7px;text-align:center;text-decoration:none;text-transform:uppercase;">Decline &amp; Delete</a></td>
            </tr>
          </table>
          <p style="margin:18px 0 0;text-align:center;font-size:10px;line-height:1.6;color:#8290a4;">Each secure link is single-use, is delivered only to Jerome's email, and expires after one action or 24 hours.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function handleReviewModeration_(request) {
  const action = String(request.reviewAction || "").toLowerCase();
  const reviewId = String(request.reviewId || "");
  const token = String(request.reviewToken || "");

  if (
    ["approve", "reject"].indexOf(action) === -1
    || !/^[a-f0-9]{32}$/i.test(reviewId)
    || !/^[a-f0-9]{64}$/i.test(token)
  ) {
    return createReviewModerationPage_(false, "Invalid moderation link", "This review action link is incomplete or invalid.");
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const storage = ensurePortfolioStorageUnlocked_();
    const match = findReviewRowUnlocked_(storage.reviewSheet, reviewId);
    if (!match || match.review.status !== "pending") {
      return createReviewModerationPage_(false, "Review already handled", "This review is no longer awaiting moderation.");
    }
    const review = match.review;

    const expectedHash = hashReviewModerationToken_(reviewId, token);
    if (!secureStringsEqual_(review.tokenHash, expectedHash)) {
      return createReviewModerationPage_(false, "Invalid moderation link", "This secure review action could not be verified.");
    }

    const tokenExpiresAt = new Date(review.tokenExpiresAt).getTime();
    if (!Number.isFinite(tokenExpiresAt) || tokenExpiresAt <= Date.now()) {
      storage.reviewSheet.getRange(match.rowNumber, 11, 1, 2).setValues([["", ""]]);
      return createReviewModerationPage_(
        false,
        "Moderation link expired",
        "This secure link has expired. Send a fresh owner approval email before trying again."
      );
    }

    if (action === "approve") {
      review.status = "approved";
      review.approvedAt = new Date().toISOString();
      storage.reviewSheet.getRange(match.rowNumber, 9, 1, 4).setValues([[
        review.status,
        review.approvedAt,
        "",
        ""
      ]]);
      return createReviewModerationPage_(
        true,
        "Review accepted and posted",
        review.name + "'s review is now published on the portfolio."
      );
    }

    storage.reviewSheet.deleteRow(match.rowNumber);
    return createReviewModerationPage_(
      true,
      "Review declined and deleted",
      "The pending review was permanently removed and will not be published."
    );
  } catch (error) {
    console.error(error);
    return createReviewModerationPage_(false, "Moderation unavailable", "The review could not be updated. Please try the link again later.");
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function createReviewModerationPage_(success, title, message) {
  const safeTitle = escapeHtml_(title);
  const safeMessage = escapeHtml_(message);
  const safeSiteUrl = escapeHtml_(CONTACT_CONFIG.siteUrl + "#reviews");
  const safeCurtainUrl = escapeHtml_(CONTACT_CONFIG.curtainImageUrl);
  const statusColor = success ? "#66e49b" : "#ff8197";

  return HtmlService.createHtmlOutput(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${safeTitle}</title>
</head>
<body style="min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:#02050c url(${safeCurtainUrl}) center/cover no-repeat;font-family:Arial,Helvetica,sans-serif;color:#eef4ff;">
  <main style="width:min(100%,560px);padding:42px 36px;border:1px solid #31568e;border-radius:22px;background:rgba(5,18,43,.96);box-shadow:0 24px 70px rgba(0,0,0,.55);text-align:center;">
    <div style="width:54px;height:54px;margin:0 auto;border:2px solid ${statusColor};border-radius:50%;display:grid;place-items:center;color:${statusColor};font-size:25px;">${success ? "&#10003;" : "!"}</div>
    <div style="margin-top:22px;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#91b8fb;">Review moderation</div>
    <h1 style="margin:12px 0 10px;font-size:34px;line-height:1.12;">${safeTitle}</h1>
    <p style="margin:0;color:#bdcdea;font-size:14px;line-height:1.7;">${safeMessage}</p>
    <a href="${safeSiteUrl}" style="display:inline-block;margin-top:28px;padding:14px 24px;border-radius:999px;background:#155fd7;color:#fff;font-size:11px;font-weight:800;letter-spacing:.8px;text-decoration:none;text-transform:uppercase;">View reviews page</a>
  </main>
</body>
</html>`);
}

function createDocumentAttachments_(request) {
  const rawPayload = String(request.attachmentsJson || "").trim();
  if (!rawPayload) {
    const legacyAttachment = createDocumentAttachment_(request);
    return legacyAttachment ? [legacyAttachment] : [];
  }

  const maximumPayloadLength = Math.ceil(CONTACT_CONFIG.maxTotalAttachmentBytes / 3) * 4
    + CONTACT_CONFIG.maxAttachments * 1024;
  if (rawPayload.length > maximumPayloadLength) throw new Error("ATTACHMENTS_TOO_LARGE");

  let entries;
  try {
    entries = JSON.parse(rawPayload);
  } catch (error) {
    throw new Error("INVALID_ATTACHMENT");
  }
  if (!Array.isArray(entries)) throw new Error("INVALID_ATTACHMENT");
  if (entries.length > CONTACT_CONFIG.maxAttachments) throw new Error("TOO_MANY_ATTACHMENTS");

  let totalBytes = 0;
  return entries.map(function (entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error("INVALID_ATTACHMENT");
    }
    const attachment = createDocumentAttachment_({
      attachmentName: entry.name,
      attachmentType: entry.type,
      attachmentSize: entry.size,
      attachmentData: entry.data
    });
    if (!attachment) throw new Error("INVALID_ATTACHMENT");
    totalBytes += attachment.sizeBytes;
    if (totalBytes > CONTACT_CONFIG.maxTotalAttachmentBytes) {
      throw new Error("ATTACHMENTS_TOO_LARGE");
    }
    return attachment;
  });
}

function createDocumentAttachment_(request) {
  const rawName = String(request.attachmentName || "").trim();
  const rawType = String(request.attachmentType || "").trim().toLowerCase();
  const rawSize = String(request.attachmentSize || "").trim();
  const rawData = String(request.attachmentData || "").trim();

  if (!rawName && !rawType && !rawSize && !rawData) return null;
  if (!rawName || !rawType || !rawSize || !rawData) throw new Error("INVALID_ATTACHMENT");

  const fileName = cleanAttachmentName_(rawName);
  const extension = getFileExtension_(fileName);
  const documentType = Object.prototype.hasOwnProperty.call(CONTACT_DOCUMENT_TYPES, extension)
    ? CONTACT_DOCUMENT_TYPES[extension]
    : null;
  const reportedSize = Number(rawSize);

  if (!documentType || rawType !== documentType.mimeType) {
    throw new Error("UNSUPPORTED_ATTACHMENT");
  }
  if (!Number.isInteger(reportedSize) || reportedSize < 1) {
    throw new Error("INVALID_ATTACHMENT");
  }
  if (reportedSize > CONTACT_CONFIG.maxAttachmentBytes) {
    throw new Error("ATTACHMENT_TOO_LARGE");
  }

  const maximumBase64Length = Math.ceil(CONTACT_CONFIG.maxAttachmentBytes / 3) * 4 + 4;
  if (rawData.length > maximumBase64Length) throw new Error("ATTACHMENT_TOO_LARGE");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(rawData)) throw new Error("INVALID_ATTACHMENT");

  let bytes;
  try {
    bytes = Utilities.base64Decode(rawData);
  } catch (error) {
    throw new Error("INVALID_ATTACHMENT");
  }

  if (bytes.length !== reportedSize) throw new Error("INVALID_ATTACHMENT");
  if (bytes.length > CONTACT_CONFIG.maxAttachmentBytes) throw new Error("ATTACHMENT_TOO_LARGE");
  if (hasExecutableSignature_(bytes)) throw new Error("UNSUPPORTED_ATTACHMENT");

  const blob = Utilities.newBlob(bytes, documentType.mimeType, fileName);
  if (!isVerifiedDocument_(blob, bytes, documentType)) {
    throw new Error("INVALID_ATTACHMENT");
  }

  return {
    blob,
    name: fileName,
    sizeBytes: bytes.length
  };
}

function cleanAttachmentName_(value) {
  const fileName = String(value || "")
    .replace(/^.*[\\/]/, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 180);
  if (!fileName || fileName === "." || fileName === "..") {
    throw new Error("INVALID_ATTACHMENT");
  }
  return fileName;
}

function getFileExtension_(fileName) {
  const match = String(fileName).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

function unsignedByte_(value) {
  return Number(value) & 255;
}

function startsWithBytes_(bytes, signature) {
  if (bytes.length < signature.length) return false;
  return signature.every(function (value, index) {
    return unsignedByte_(bytes[index]) === value;
  });
}

function hasExecutableSignature_(bytes) {
  const executableSignatures = [
    [0x4d, 0x5a],
    [0x7f, 0x45, 0x4c, 0x46],
    [0xfe, 0xed, 0xfa, 0xce],
    [0xfe, 0xed, 0xfa, 0xcf],
    [0xce, 0xfa, 0xed, 0xfe],
    [0xcf, 0xfa, 0xed, 0xfe],
    [0xca, 0xfe, 0xba, 0xbe],
    [0x4c, 0x00, 0x00, 0x00, 0x01, 0x14, 0x02, 0x00],
    [0x23, 0x21]
  ];
  return executableSignatures.some(function (signature) {
    return startsWithBytes_(bytes, signature);
  });
}

function isVerifiedDocument_(blob, bytes, documentType) {
  if (documentType.kind === "pdf") {
    return startsWithBytes_(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }
  if (documentType.kind === "rtf") {
    return bytesToAscii_(bytes, 12).indexOf("{\\rtf") === 0;
  }
  if (documentType.kind === "text") return isPlainTextDocument_(bytes);
  if (documentType.kind === "zip") return isVerifiedDocumentPackage_(blob, documentType);
  return false;
}

function isPlainTextDocument_(bytes) {
  return bytes.every(function (value) {
    const byte = unsignedByte_(value);
    return byte >= 32 || byte === 9 || byte === 10 || byte === 13 || byte >= 128;
  });
}

function bytesToAscii_(bytes, maximumLength) {
  return bytes.slice(0, maximumLength).map(function (value) {
    return String.fromCharCode(unsignedByte_(value));
  }).join("");
}

function isVerifiedDocumentPackage_(blob, documentType) {
  if (!startsWithBytes_(blob.getBytes(), [0x50, 0x4b, 0x03, 0x04])) return false;

  let entries;
  try {
    entries = Utilities.unzip(blob);
  } catch (error) {
    return false;
  }

  const blockedEntryPattern = /(^|\/)(vbaProject\.bin|[^/]+\.(?:exe|com|dll|jar|msi|bat|cmd|ps1|scr|app))$/i;
  const entryNames = [];
  let packageMimeType = "";
  let totalBytes = 0;

  for (let index = 0; index < entries.length; index += 1) {
    const entryName = String(entries[index].getName() || "").replace(/\\/g, "/");
    if (blockedEntryPattern.test(entryName)) return false;
    entryNames.push(entryName);
    if (entryName === "mimetype") {
      packageMimeType = entries[index].getDataAsString().trim();
    }
    totalBytes += entries[index].getBytes().length;
    if (totalBytes > CONTACT_CONFIG.maxUncompressedAttachmentBytes) return false;
  }

  const hasRequiredEntries = documentType.requiredEntries.every(function (requiredEntry) {
    return entryNames.indexOf(requiredEntry) !== -1;
  });
  if (!hasRequiredEntries) return false;
  return entryNames.indexOf("mimetype") === -1 || packageMimeType === documentType.mimeType;
}

function formatAttachmentSize_(bytes) {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createPlainTextEmail_(name, email, message, submittedAt, attachmentInfos) {
  const attachments = Array.isArray(attachmentInfos)
    ? attachmentInfos
    : attachmentInfos ? [attachmentInfos] : [];
  const lines = [
    "NEW PORTFOLIO COLLABORATION INQUIRY",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Submitted: ${submittedAt} (Asia/Manila)`,
    "",
    "PROJECT DETAILS",
    message
  ];
  if (attachments.length) {
    lines.push("", `ATTACHED DOCUMENTS (${attachments.length})`);
    attachments.forEach(function (attachmentInfo, index) {
      lines.push(
        `${index + 1}. ${attachmentInfo.name} (${formatAttachmentSize_(attachmentInfo.sizeBytes)})`
      );
    });
  }
  lines.push("", "Reply to this email to respond directly to the sender.");
  return lines.join("\n");
}

function createHtmlEmail_(name, email, message, submittedAt, attachmentInfos) {
  const attachments = Array.isArray(attachmentInfos)
    ? attachmentInfos
    : attachmentInfos ? [attachmentInfos] : [];
  const safeName = escapeHtml_(name);
  const safeEmail = escapeHtml_(email);
  const safeMessage = escapeHtml_(message).replace(/\r?\n/g, "<br>");
  const safeSubmittedAt = escapeHtml_(submittedAt);
  const safeInitial = escapeHtml_(name.charAt(0).toUpperCase());
  const replySubject = escapeHtml_(encodeURIComponent(`Re: Portfolio inquiry from ${name}`));
  const curtainImageUrl = CONTACT_CONFIG.curtainImageUrl;
  const profileImageUrl = CONTACT_CONFIG.profileImageUrl;
  const siteUrl = CONTACT_CONFIG.siteUrl;
  const attachmentRows = attachments.map(function (attachmentInfo, index) {
    return `
                      <div style="${index ? "margin-top:10px;padding-top:10px;border-top:1px solid #cfdbed;" : ""}">
                        <div style="font-size:13px;font-weight:700;line-height:1.5;color:#14294c;">${escapeHtml_(attachmentInfo.name)}</div>
                        <div style="margin-top:2px;font-size:11px;color:#617695;">${escapeHtml_(formatAttachmentSize_(attachmentInfo.sizeBytes))} &middot; verified document</div>
                      </div>`;
  }).join("");
  const attachmentBlock = attachments.length ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;">
                <tr>
                  <td style="padding:14px 16px;border:1px solid #b9ccec;border-radius:12px;background:#eaf1ff;color:#18345f;">
                    <div style="font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#3975d5;">Attached documents (${attachments.length})</div>
                    <div style="margin-top:8px;">${attachmentRows}</div>
                  </td>
                </tr>
              </table>` : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @media only screen and (max-width:620px) {
      .email-shell { width:100% !important; }
      .email-pad { padding-left:22px !important; padding-right:22px !important; }
      .email-title { font-size:34px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#02050c;font-family:Arial,Helvetica,sans-serif;color:#eef4ff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safeName} sent a new project inquiry through your portfolio.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" background="${curtainImageUrl}" style="width:100%;background-color:#02050c;background-image:url(${curtainImageUrl});background-position:center top;background-size:cover;padding:34px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" class="email-shell" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;border:1px solid #284475;background:#07101f;border-radius:24px;overflow:hidden;box-shadow:0 22px 60px rgba(0,0,0,.5);">
          <tr>
            <td class="email-pad" background="${curtainImageUrl}" style="padding:36px 42px 40px;background-color:#06122a;background-image:linear-gradient(90deg,rgba(1,5,12,.42),rgba(20,75,180,.28)),url(${curtainImageUrl});background-position:center;background-size:cover;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td width="64" height="64" align="center" valign="middle" style="width:64px;height:64px;border:2px solid #9bc1ff;border-radius:50%;background:#0d5fe9;box-shadow:0 0 0 7px rgba(63,126,255,.14);overflow:hidden;">
                    <img src="${profileImageUrl}" width="64" height="64" alt="Jerome Balangue" style="display:block;width:64px;height:64px;border:0;border-radius:50%;object-fit:cover;object-position:center 24%;">
                  </td>
                </tr>
              </table>
              <div style="margin-top:24px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#94b9ff;">Jerome Balangue Portfolio</div>
              <h1 class="email-title" style="margin:13px 0 10px;font-size:42px;line-height:1.05;font-weight:700;letter-spacing:-1.5px;color:#ffffff;">New Project<br>Inquiry</h1>
              <p style="margin:0 auto;max-width:430px;font-size:14px;line-height:1.7;color:#d4e3ff;">A fresh creative opportunity has arrived through your portfolio website.</p>
            </td>
          </tr>
          <tr>
            <td class="email-pad" style="padding:34px 42px 38px;background:#0b46a0;">
              <div style="font-size:19px;font-weight:700;line-height:1.4;color:#ffffff;">Hi Jerome,</div>
              <p style="margin:10px 0 26px;font-size:14px;line-height:1.75;color:#dfebff;">Someone is interested in working with you. Here are the details they submitted so you can review the opportunity and reply directly.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:20px;border:1px solid #5f91e4;border-radius:18px;background:#123e88;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="58" valign="middle" style="width:58px;">
                          <div style="width:48px;height:48px;line-height:48px;border-radius:50%;background:#ffffff;color:#1559c7;font-size:20px;font-weight:800;text-align:center;">${safeInitial}</div>
                        </td>
                        <td class="sender-cell" valign="middle">
                          <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#aecdff;">Potential client</div>
                          <div style="margin-top:5px;font-size:20px;font-weight:700;color:#ffffff;">${safeName}</div>
                          <a href="mailto:${safeEmail}" style="display:inline-block;margin-top:5px;color:#d9e8ff;text-decoration:underline;">${safeEmail}</a>
                        </td>
                        <td class="reply-cell" align="right" valign="middle">
                          <a href="mailto:${safeEmail}?subject=${replySubject}" style="display:inline-block;padding:12px 18px;border:1px solid #ffffff;border-radius:999px;background:#ffffff;color:#104fae;font-size:11px;font-weight:800;letter-spacing:.8px;text-decoration:none;text-transform:uppercase;white-space:nowrap;">Reply now</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-pad" style="padding:36px 42px 38px;background:#f4f7fc;color:#0a1630;">
              <div style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-align:center;text-transform:uppercase;color:#3975d5;">Project brief</div>
              <h2 style="margin:10px 0 22px;font-size:25px;line-height:1.25;text-align:center;color:#07152e;">What would they like to create?</h2>
              <div style="padding:22px 24px;border:1px solid #cad8ef;border-radius:16px;background:#ffffff;font-size:15px;line-height:1.75;color:#263852;box-shadow:0 8px 24px rgba(21,62,126,.08);">${safeMessage}</div>
              ${attachmentBlock}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td align="center" style="padding:0 8px;">
                    <div style="font-size:18px;color:#3275e6;">&#10003;</div>
                    <div style="margin-top:5px;font-size:9px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:#60718d;">Portfolio form</div>
                  </td>
                  <td align="center" style="padding:0 8px;border-left:1px solid #d6e0ef;border-right:1px solid #d6e0ef;">
                    <div style="font-size:18px;color:#3275e6;">&#10003;</div>
                    <div style="margin-top:5px;font-size:9px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:#60718d;">Form validated</div>
                  </td>
                  <td align="center" style="padding:0 8px;">
                    <div style="font-size:18px;color:#3275e6;">&#10003;</div>
                    <div style="margin-top:5px;font-size:9px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:#60718d;">Direct reply</div>
                  </td>
                </tr>
              </table>
              <div style="margin-top:28px;text-align:center;">
                <a href="mailto:${safeEmail}?subject=${replySubject}" style="display:inline-block;padding:14px 25px;border-radius:999px;background:#155fd7;color:#ffffff;font-size:11px;font-weight:800;letter-spacing:1px;text-decoration:none;text-transform:uppercase;">Respond to ${safeName}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td class="email-pad" background="${curtainImageUrl}" style="padding:22px 42px;background-color:#061126;background-image:linear-gradient(90deg,rgba(1,5,12,.45),rgba(17,62,150,.32)),url(${curtainImageUrl});background-position:center bottom;background-size:cover;text-align:center;font-size:11px;line-height:1.7;color:#9fb5d8;">
              Submitted ${safeSubmittedAt} (Asia/Manila)<br>
              <a href="${siteUrl}" style="color:#c8dbff;text-decoration:none;">jeromebalangue.github.io</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function createBrowserResponse_(payload) {
  const response = JSON.stringify({
    source: CONTACT_CONFIG.responseSource,
    type: String(payload.type || "result"),
    success: Boolean(payload.success),
    message: String(payload.message || ""),
    documentAttachments: Boolean(payload.documentAttachments),
    maxAttachmentBytes: Number(payload.maxAttachmentBytes || 0),
    maxAttachments: Number(payload.maxAttachments || 0),
    maxTotalAttachmentBytes: Number(payload.maxTotalAttachmentBytes || 0),
    reviewSubmissions: Boolean(payload.reviewSubmissions),
    portfolioStorage: Boolean(payload.portfolioStorage),
    reviews: Array.isArray(payload.reviews) ? payload.reviews : []
  }).replace(/</g, "\\u003c");
  const targetOrigin = JSON.stringify(CONTACT_CONFIG.allowedOrigin);

  return HtmlService.createHtmlOutput(
    `<!doctype html><meta charset="utf-8"><script>window.top.postMessage(${response},${targetOrigin});</script>`
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
