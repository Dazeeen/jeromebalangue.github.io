(() => {
    "use strict";

    const catalogUrl = "https://script.google.com/macros/s/AKfycbybFNp4KFW6KWvfRvriRpCUnZFj8P1ZBQmSZ4ENcuavSS05Q3Pjk4ESs9BJmhiIToQujw/exec";
    const mediaFolderId = "18SAnq0Bb9ghlt2mG0jPKkSmh0hw7qvAT";
    const fileDefinitions = {
        "images/about/jerome-laptop-cutout.png": ["10BJZLxjdvVAzFq2gq89UAthh-DQgezRo", "image/png"],
        "images/AI_generated_design/brighter-choice-ai-design.png": ["1tTGJQ7a_it-hMkVgY7vUdY_Tcavk0reD", "image/png"],
        "images/AI_generated_design/easter-sunday-ai-design.png": ["18p3qr9i_K7NaVrdF6pGnASFIwUxYQFP-", "image/png"],
        "images/AI_generated_design/rising-energy-cost-ai-design.jpg": ["1DQdv68FVhVFJq9ntrvKS0I1ifQ-WuabG", "image/jpeg"],
        "images/AI_generated_design/solar-installation-ai-scene.png": ["12DQszNUKaJZXSHJ0HrqQu2G_1PwfOXlE", "image/png"],
        "images/AI_generated_design/summer-cooling-ai-design.png": ["1l15_OuyBGY0V51SjyeDOmsa0swWPWSqi", "image/png"],
        "images/archive/social-media-designs/campaign/easter-sunday-campaign.png": ["1XqImZ8kTZWVQ5QMQeff93J5PjFCkYY4_", "image/png"],
        "images/archive/social-media-designs/product/premium-burger-promotion.png": ["1ThTY3jcCfHTJEU2EJGywb3rGjIvTdD2n", "image/png"],
        "images/archive/social-media-designs/real-estate/everglens-site-tripping.jpg": ["14C25H9KveKXxn0vRjmHwQMMgYcF89frf", "image/jpeg"],
        "images/archive/social-media-designs/solar/12kw-hybrid-system-offer.png": ["1ElW1ZAZ8Qc9GYf_RcEYVsQLyF0VFjLCa", "image/png"],
        "images/archive/social-media-designs/solar/rising-energy-costs.jpg": ["11vJ3qmNJ9vQSGUxfoNR7bpDOdOe9obaI", "image/jpeg"],
        "images/home/jerome-hero-cutout.png": ["1_yIVXlPeFAeFLOZxWs7UTMhw7TAqFzN-", "image/png"],
        "images/home/jerome-hero-portrait.jpg": ["1JDN_LOQexli7mBBp2bNqW_e4lUMz6m3m", "image/jpeg"],
        "images/print-marketing-materials/booth/exhibition-booth-back.png": ["1Gz0-CmwwRreGcA0_SAe_SkBIOqs5eecw", "image/png"],
        "images/print-marketing-materials/booth/exhibition-booth-front.png": ["1htidRUWCaQd885nsA-eC_3NwCBgNV-D4", "image/png"],
        "images/print-marketing-materials/calling-card/calling-card-back.png": ["1KYrWy8-IKCzHcIGrbNP5FtxiC2Czs4Bn", "image/png"],
        "images/print-marketing-materials/calling-card/calling-card-front.png": ["13_EsyZrMxaWrezSlFbiCIVRI7V9kw5m-", "image/png"],
        "images/print-marketing-materials/flyer/solar-product-flyer-back.png": ["1PryADVDdwnXw3-KdYXpX0f08Q1lI7bA0", "image/png"],
        "images/print-marketing-materials/flyer/solar-product-flyer-front.png": ["1xHJF8aq0pCOtxIOPhzCO4ryj1An76uP5", "image/png"],
        "images/print-marketing-materials/notebook/alternates/notebook-front-original.png": ["1EbTpsnmZUZnSnCZkESXfin7e8TnKOc56", "image/png"],
        "images/print-marketing-materials/notebook/alternates/notebook-front-version-2.png": ["1FN_-z7uHjNmXAQGK0-D8SbiWNLamBUeu", "image/png"],
        "images/print-marketing-materials/notebook/notebook-back.png": ["1JHxkWT4r2n1gSd9rhbZ2NNr_66vs289E", "image/png"],
        "images/print-marketing-materials/notebook/notebook-front.png": ["10FEG3x4F-VGtJYhrj5hiTbUqjZYQISOe", "image/png"],
        "images/print-marketing-materials/notebook/notebook-gift-set.jpg": ["1OwxMg7pTtJx6loTPTvAC6Aw1yXXUAEfq", "image/jpeg"],
        "images/print-marketing-materials/pen/corporate-ball-pen.png": ["1cl-2b0zi1i1ph6B1T9wYwvJjjiDfxFAY", "image/png"],
        "images/print-marketing-materials/roll-up-banner/solar-pv-roll-up-banner-artwork.jpg": ["1ohJEybMu5wNvk_S63UlHy9icedrJQzPu", "image/jpeg"],
        "images/print-marketing-materials/roll-up-banner/solar-pv-roll-up-banner-mockup.png": ["16vIpag1Z4F7CUfA1NZGcECxi5ONfzXpI", "image/png"],
        "images/print-marketing-materials/roll-up-banner/solar-pv-roll-up-banner.png": ["1CErEfku7NzWkyqQgXXJpWoYYQlmRcdpe", "image/png"],
        "images/site/portfolio-background.png": ["1Ot_dZXQnqWO_bNbGQE6gdhXietuIP2UV", "image/png"],
        "images/social-media-designs/--Campaign--/palm-sunday-campaign.png": ["13tuGis47D8fGyAO8_ZjdX5NlYbMpa2Cp", "image/png"],
        "images/social-media-designs/--Product--/prefab-solutions-sold-out-campaign.png": ["1aEGBdSqyFTeyD0SeTOWCi6TnW8iKOt52", "image/png"],
        "images/social-media-designs/--Product--/tcl-air-conditioner-promotion.png": ["1BFJUa0n1ooFeOOuJo6-stZAf2fmE75de", "image/png"],
        "images/social-media-designs/--Real Estate--/walnut-house-campaign.jpg": ["1KhnZK68g-zKtvtvewx9cZUsA4FiulbNN", "image/jpeg"],
        "images/social-media-designs/--Real Estate--/walnut-house-features.jpg": ["1l65h7Gk74gMT0Q45mx6-dKoOR_RdoMxf", "image/jpeg"],
        "images/social-media-designs/--Solar--/avantech-12kw-hybrid-system.png": ["1nk_G0HW6aX_Q13S3xqu6nQ39cflzisY1", "image/png"],
        "images/social-media-designs/--Solar--/avantech-brighter-choice.png": ["1WX7hp_xQ8sq3OAaA_2G_OhsP1wHhGYmM", "image/png"],
        "images/social-media-designs/--Solar--/avantech-saturn-hybrid-inverter.jpg": ["1o3lbnSEeqhpJ28sQMG1A6-IrWllmpzUA", "image/jpeg"],
        "images/social-media-designs/--Solar--/save-more-with-solar.png": ["1WjIpFWwXt-JeG_c36x7bd4_lEAeDOOaB", "image/png"],
        "images/social-media-designs/--Solar--/solar-storage-solutions.png": ["16fdoOM-FuTcRf5iBzda5TGSCkh_ILf9Z", "image/png"],
        "images/source-assets/portraits/jerome-gimbal-source.png": ["1j-uwzmrIU_fIroCdSKSuV8QSMIKLe2rr", "image/png"],
        "images/source-assets/portraits/jerome-laptop-source.png": ["1hMta9pq-LxxMrPivnGudb-y_Wq7u0wD9", "image/png"],
        "images/source-assets/social-media/solar-installation-reference.png": ["1H2xSmxuq304PbpHQDQ9XOYirqPKImqkm", "image/png"],
        "videos/--App Promotional Video--/AIRPLANE CHEFS.mp4": ["17yFNFpGj25i2doLnYId70_9MFvLHmugH", "video/mp4"],
        "videos/--App Promotional Video--/ALIEXPRESS.mp4": ["1GHJfoJXtN71UisN97h-aDqSPZw7ZNFt1", "video/mp4"],
        "videos/--App Promotional Video--/DONNA AI.mp4": ["1Uc1NzImIA-V9ImUBNHSd9MeGe_3WtOcH", "video/mp4"],
        "videos/--App Promotional Video--/MORROW.mp4": ["1PrU1rwGgvrAGiCi6YHr06_7jeM318_hj", "video/mp4"],
        "videos/--Editing Project--/39ERS PRODUCTS COMMERCIAL.mp4": ["11HktOpeUmngvBNqRPBWjqlQ0WNLyezVD", "video/mp4"],
        "videos/--Editing Project--/CINEMATIC 01.mp4": ["1a6iRA74OFdEOFZBvQKKAUnEsyFFmjfmz", "video/mp4"],
        "videos/--Editing Project--/CINEMATIC 02.mp4": ["1aD72jhWyuDOASyklpso8C0DePGhxv-pg", "video/mp4"],
        "videos/--Editing Project--/CINEMATIC 03.mp4": ["1o5_5fMmzaJzSLyClZhLNb_Z6Ndu9yjZ6", "video/mp4"],
        "videos/--Editing Project--/LUCKY ME PANCIT CANTON COMMERCIAL.mp4": ["1siwpo5rCZD0_Q2-DmdJbkIVcNdhMiwoR", "video/mp4"],
        "videos/--Trend Editing--/BDO AND HOME CREDIT INSTALLMENT.mp4": ["1x1yMdiTFBJv6gbNO3IWzG-l8qatfCLOG", "video/mp4"],
        "videos/--Trend Editing--/INCOMING PRODUCT UNIT.mp4": ["1S7X4U-3KqasmNR-m4ji3uHD_QYiPda4F", "video/mp4"],
        "videos/--Trend Editing--/NET METERING.mp4": ["1NXEPOu7chyaavSSg3ywLjkjcG14ZEEzR", "video/mp4"]
    };

    const originalMediaUrl = (id) => (
        `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}`
        + "&export=download&authuser=0&confirm=t"
    );
    const imageUrl = (id) => (
        `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w4096`
    );
    const assets = Object.fromEntries(Object.entries(fileDefinitions).map(([path, definition]) => {
        const [id, mimeType] = definition;
        const file = path.split("/").pop();
        return [path, {
            id,
            file,
            mimeType,
            src: mimeType.startsWith("video/") ? originalMediaUrl(id) : imageUrl(id),
            original: originalMediaUrl(id)
        }];
    }));
    const imageEntry = (path, alt, width, height) => ({
        ...assets[path],
        alt,
        ...(width > 0 && height > 0 ? { width, height } : {})
    });
    const videoEntry = (path, title) => ({
        ...assets[path],
        title
    });

    const galleries = {
        social: {
            version: 1,
            folderPattern: "--Category Name--",
            imageCount: 10,
            categories: [
                {
                    id: "campaign",
                    name: "Campaign",
                    folder: "--Campaign--",
                    images: [imageEntry(
                        "images/social-media-designs/--Campaign--/palm-sunday-campaign.png",
                        "Palm Sunday Campaign"
                    )]
                },
                {
                    id: "product",
                    name: "Product",
                    folder: "--Product--",
                    images: [
                        imageEntry(
                            "images/social-media-designs/--Product--/prefab-solutions-sold-out-campaign.png",
                            "Prefab Solutions Sold Out Campaign"
                        ),
                        imageEntry(
                            "images/social-media-designs/--Product--/tcl-air-conditioner-promotion.png",
                            "Tcl Air Conditioner Promotion"
                        )
                    ]
                },
                {
                    id: "real-estate",
                    name: "Real Estate",
                    folder: "--Real Estate--",
                    images: [
                        imageEntry(
                            "images/social-media-designs/--Real Estate--/walnut-house-campaign.jpg",
                            "Walnut House Campaign"
                        ),
                        imageEntry(
                            "images/social-media-designs/--Real Estate--/walnut-house-features.jpg",
                            "Walnut House Features"
                        )
                    ]
                },
                {
                    id: "solar",
                    name: "Solar",
                    folder: "--Solar--",
                    images: [
                        imageEntry(
                            "images/social-media-designs/--Solar--/avantech-12kw-hybrid-system.png",
                            "Avantech 12kW Hybrid System"
                        ),
                        imageEntry(
                            "images/social-media-designs/--Solar--/avantech-brighter-choice.png",
                            "Avantech Brighter Choice"
                        ),
                        imageEntry(
                            "images/social-media-designs/--Solar--/avantech-saturn-hybrid-inverter.jpg",
                            "Avantech Saturn Hybrid Inverter"
                        ),
                        imageEntry(
                            "images/social-media-designs/--Solar--/save-more-with-solar.png",
                            "Save More With Solar"
                        ),
                        imageEntry(
                            "images/social-media-designs/--Solar--/solar-storage-solutions.png",
                            "Solar Storage Solutions"
                        )
                    ]
                }
            ]
        },
        ai: {
            version: 1,
            imageCount: 5,
            images: [
                imageEntry("images/AI_generated_design/brighter-choice-ai-design.png", "Brighter Choice AI Design", 1080, 1350),
                imageEntry("images/AI_generated_design/easter-sunday-ai-design.png", "Easter Sunday AI Design", 1080, 1350),
                imageEntry("images/AI_generated_design/rising-energy-cost-ai-design.jpg", "Rising Energy Cost AI Design", 1080, 1350),
                imageEntry("images/AI_generated_design/solar-installation-ai-scene.png", "Solar Installation AI Scene", 1408, 768),
                imageEntry("images/AI_generated_design/summer-cooling-ai-design.png", "Summer Cooling AI Design", 1080, 1350)
            ]
        },
        video: {
            version: 1,
            folderPattern: "--Category Name--",
            videoCount: 12,
            categories: [
                {
                    id: "app-promotional-video",
                    name: "App Promotional Video",
                    folder: "--App Promotional Video--",
                    videos: [
                        videoEntry("videos/--App Promotional Video--/AIRPLANE CHEFS.mp4", "AIRPLANE CHEFS"),
                        videoEntry("videos/--App Promotional Video--/ALIEXPRESS.mp4", "ALIEXPRESS"),
                        videoEntry("videos/--App Promotional Video--/DONNA AI.mp4", "DONNA AI"),
                        videoEntry("videos/--App Promotional Video--/MORROW.mp4", "MORROW")
                    ]
                },
                {
                    id: "trend-editing",
                    name: "Trend Editing",
                    folder: "--Trend Editing--",
                    videos: [
                        videoEntry("videos/--Trend Editing--/BDO AND HOME CREDIT INSTALLMENT.mp4", "BDO AND HOME CREDIT INSTALLMENT"),
                        videoEntry("videos/--Trend Editing--/INCOMING PRODUCT UNIT.mp4", "INCOMING PRODUCT UNIT"),
                        videoEntry("videos/--Trend Editing--/NET METERING.mp4", "NET METERING")
                    ]
                },
                {
                    id: "editing-project",
                    name: "Editing Project",
                    folder: "--Editing Project--",
                    videos: [
                        videoEntry("videos/--Editing Project--/39ERS PRODUCTS COMMERCIAL.mp4", "39ERS PRODUCTS COMMERCIAL"),
                        videoEntry("videos/--Editing Project--/CINEMATIC 01.mp4", "CINEMATIC 01"),
                        videoEntry("videos/--Editing Project--/CINEMATIC 02.mp4", "CINEMATIC 02"),
                        videoEntry("videos/--Editing Project--/CINEMATIC 03.mp4", "CINEMATIC 03"),
                        videoEntry("videos/--Editing Project--/LUCKY ME PANCIT CANTON COMMERCIAL.mp4", "LUCKY ME PANCIT CANTON COMMERCIAL")
                    ]
                }
            ]
        }
    };

    window.DRIVE_MEDIA_CONFIG = Object.freeze({
        catalogUrl,
        mediaFolderId,
        mediaFolderUrl: `https://drive.google.com/drive/folders/${mediaFolderId}`,
        catalogTimeoutMs: 8000,
        cacheBucketMs: 60000
    });
    window.DRIVE_MEDIA_FALLBACK = {
        version: 1,
        ok: true,
        source: "google-drive-static-fallback",
        assets,
        galleries
    };
    window.SOCIAL_GALLERY_MANIFEST = galleries.social;
    window.AI_GALLERY_MANIFEST = galleries.ai;
    window.VIDEO_GALLERY_MANIFEST = galleries.video;
})();
