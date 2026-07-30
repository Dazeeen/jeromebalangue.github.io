import * as THREE from "../vendor/three/three.module.min.js";

const degreesToRadians = (degrees) => THREE.MathUtils.degToRad(degrees);
const bannerArtworkRegion = {
    x: 302,
    y: 58,
    width: 476,
    height: 1217
};
const boothArtworkRegions = {
    header: { x: 840, y: 190, width: 470, height: 185 },
    front: { x: 838, y: 868, width: 486, height: 545 },
    left: { x: 386, y: 870, width: 240, height: 545 },
    right: { x: 1532, y: 880, width: 242, height: 535 }
};
const notebookArtworkRegions = {
    strap: { x: 270, y: 304, width: 233, height: 76 },
    strapMount: { x: 270, y: 303, width: 118, height: 80 }
};

export class PrintWebGLViewer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        this.camera.position.set(0, 0.25, 9);
        this.root = new THREE.Group();
        this.scene.add(this.root);

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.textureLoader = new THREE.TextureLoader();
        this.maximumAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
        this.currentKind = "";

        const ambientLight = new THREE.HemisphereLight(0xdceaff, 0x07101c, 2.1);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 4.1);
        keyLight.position.set(4.5, 6.5, 7);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.camera.near = 0.1;
        keyLight.shadow.camera.far = 30;
        keyLight.shadow.camera.left = -8;
        keyLight.shadow.camera.right = 8;
        keyLight.shadow.camera.top = 8;
        keyLight.shadow.camera.bottom = -8;
        this.scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x72aaff, 2.4);
        rimLight.position.set(-5, 2.5, -6);
        this.scene.add(rimLight);

        const fillLight = new THREE.PointLight(0xbcd8ff, 9, 16);
        fillLight.position.set(-3.5, 0.5, 5);
        this.scene.add(fillLight);

        this.render();
    }

    get isReady() {
        return Boolean(this.renderer);
    }

    resize(width, height) {
        const safeWidth = Math.max(1, Math.round(width));
        const safeHeight = Math.max(1, Math.round(height));
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);

        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(safeWidth, safeHeight, false);
        this.camera.aspect = safeWidth / safeHeight;
        const isNarrowViewport = safeWidth / safeHeight < 0.85;
        if (this.currentKind === "booth") {
            this.camera.position.z = isNarrowViewport ? 12.8 : 8.4;
        } else if (this.currentKind === "banner") {
            this.camera.position.z = isNarrowViewport ? 10.2 : 9.2;
        } else if (this.currentKind === "notebook") {
            this.camera.position.z = isNarrowViewport ? 9.8 : 7.4;
        } else if (this.currentKind === "pen") {
            this.camera.position.z = isNarrowViewport ? 9.2 : 7.1;
        }
        this.camera.lookAt(0, 0, 0);
        this.camera.updateProjectionMatrix();
        this.render();
    }

    setRotation(rotationX, rotationY) {
        this.root.rotation.x = degreesToRadians(rotationX);
        this.root.rotation.y = degreesToRadians(rotationY);
        this.render();
    }

    setModel(kind, textureSource, backTextureSource = textureSource) {
        this.disposeRoot();
        this.currentKind = kind;

        if (kind === "banner") {
            this.buildRollUpBanner(textureSource);
            this.camera.position.set(0, 0.2, 9.2);
        } else if (kind === "notebook") {
            this.buildNotebook(textureSource, backTextureSource);
            this.camera.position.set(0, 0.05, 7.4);
        } else if (kind === "pen") {
            this.buildBallPen();
            this.camera.position.set(0, 0.05, 7.1);
        } else if (kind === "booth") {
            this.buildCollapsibleBooth(textureSource);
            this.camera.position.set(0, 0.2, 8.4);
        }

        this.camera.lookAt(0, 0, 0);
        this.render();
    }

    loadTexture(source, onLoad) {
        return this.textureLoader.load(
            source,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.anisotropy = this.maximumAnisotropy;
                texture.needsUpdate = true;
                onLoad?.(texture);
                this.render();
            },
            undefined,
            () => this.render()
        );
    }

    createCroppedTexture(texture, region, backgroundColor = "#e8f1f7") {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = region.width;
        canvas.height = region.height;

        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
            texture.image,
            region.x,
            region.y,
            region.width,
            region.height,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const croppedTexture = new THREE.CanvasTexture(canvas);
        croppedTexture.colorSpace = THREE.SRGBColorSpace;
        croppedTexture.anisotropy = this.maximumAnisotropy;
        croppedTexture.needsUpdate = true;
        return croppedTexture;
    }

    createArtworkMaterial(options = {}) {
        return new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.02,
            roughness: 0.58,
            ...options
        });
    }

    createMetalMaterial(color = 0xb9c2cc) {
        return new THREE.MeshStandardMaterial({
            color,
            metalness: 0.86,
            roughness: 0.24
        });
    }

    createBox(width, height, depth, material, position) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            material
        );
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.root.add(mesh);
        return mesh;
    }

    createCylinder(radius, length, material, position) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, length, 32),
            material
        );
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.root.add(mesh);
        return mesh;
    }

    createRoundedRectangleShape(width, height, radius) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const safeRadius = Math.min(radius, halfWidth, halfHeight);
        const shape = new THREE.Shape();

        shape.moveTo(-halfWidth + safeRadius, -halfHeight);
        shape.lineTo(halfWidth - safeRadius, -halfHeight);
        shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + safeRadius);
        shape.lineTo(halfWidth, halfHeight - safeRadius);
        shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - safeRadius, halfHeight);
        shape.lineTo(-halfWidth + safeRadius, halfHeight);
        shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - safeRadius);
        shape.lineTo(-halfWidth, -halfHeight + safeRadius);
        shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + safeRadius, -halfHeight);

        return shape;
    }

    normalizeShapeUvs(geometry, width, height) {
        const positions = geometry.getAttribute("position");
        const uvs = geometry.getAttribute("uv");

        for (let index = 0; index < positions.count; index += 1) {
            uvs.setXY(
                index,
                THREE.MathUtils.clamp((positions.getX(index) + width / 2) / width, 0, 1),
                THREE.MathUtils.clamp((positions.getY(index) + height / 2) / height, 0, 1)
            );
        }

        uvs.needsUpdate = true;
    }

    createRoundedBox(
        width,
        height,
        depth,
        radius,
        shellMaterial,
        frontMaterial,
        backMaterial,
        position,
        bevel = 0.035
    ) {
        const shape = this.createRoundedRectangleShape(width, height, radius);
        const group = new THREE.Group();
        const shellGeometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: bevel > 0,
            bevelSegments: 4,
            bevelSize: bevel,
            bevelThickness: bevel,
            curveSegments: 16
        });
        shellGeometry.translate(0, 0, -depth / 2);

        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.castShadow = true;
        shell.receiveShadow = true;
        group.add(shell);

        if (frontMaterial) {
            const frontGeometry = new THREE.ShapeGeometry(shape, 24);
            this.normalizeShapeUvs(frontGeometry, width, height);
            const front = new THREE.Mesh(frontGeometry, frontMaterial);
            front.position.z = depth / 2 + bevel + 0.006;
            front.castShadow = true;
            group.add(front);
        }

        if (backMaterial) {
            const backGeometry = new THREE.ShapeGeometry(shape, 24);
            this.normalizeShapeUvs(backGeometry, width, height);
            const back = new THREE.Mesh(backGeometry, backMaterial);
            back.position.z = -(depth / 2 + bevel + 0.006);
            back.rotation.y = Math.PI;
            back.castShadow = true;
            group.add(back);
        }

        group.position.set(position.x, position.y, position.z);
        this.root.add(group);
        return group;
    }

    createRoundedPanel(width, height, radius, material, position) {
        const shape = this.createRoundedRectangleShape(width, height, radius);
        const geometry = new THREE.ShapeGeometry(shape, 24);
        this.normalizeShapeUvs(geometry, width, height);
        const panel = new THREE.Mesh(geometry, material);
        panel.position.set(position.x, position.y, position.z);
        panel.castShadow = true;
        this.root.add(panel);
        return panel;
    }

    createPenLabelTexture() {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 256;
        canvas.height = 1024;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(190, 865);
        context.rotate(-Math.PI / 2);
        context.fillStyle = "rgba(255, 255, 255, 0.96)";
        context.font = "700 82px Arial, sans-serif";
        context.fillText("AvanTech", 0, 0);
        context.font = "600 24px Arial, sans-serif";
        context.fillText("INTEGRATED TECHNOLOGY SOLUTIONS", 5, 52);
        context.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = this.maximumAnisotropy;
        texture.needsUpdate = true;
        return texture;
    }

    addGroundShadow(width, depth, y) {
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(1, 64),
            new THREE.ShadowMaterial({
                color: 0x000000,
                opacity: 0.48
            })
        );
        shadow.scale.set(width, depth, 1);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = y;
        shadow.receiveShadow = true;
        this.root.add(shadow);
    }

    buildRollUpBanner(textureSource) {
        const metal = this.createMetalMaterial();
        const darkMetal = this.createMetalMaterial(0x65717e);
        const edgeMaterial = this.createMetalMaterial(0xaeb8c2);
        const frontMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.02,
            roughness: 0.64
        });
        const backMaterial = new THREE.MeshStandardMaterial({
            color: 0x6d7782,
            metalness: 0.18,
            roughness: 0.62
        });
        const sideMaterials = [
            edgeMaterial,
            edgeMaterial,
            edgeMaterial,
            edgeMaterial,
            frontMaterial,
            backMaterial
        ];

        const banner = new THREE.Mesh(
            new THREE.BoxGeometry(1.76, 4.48, 0.08),
            sideMaterials
        );
        banner.position.set(0, 0.35, 0);
        banner.castShadow = true;
        banner.receiveShadow = true;
        this.root.add(banner);

        this.loadTexture(textureSource, (texture) => {
            frontMaterial.map = this.createCroppedTexture(
                texture,
                bannerArtworkRegion,
                "#edf1f5"
            );
            frontMaterial.needsUpdate = true;
            texture.dispose();
        });

        const topRail = this.createCylinder(
            0.095,
            2.02,
            metal,
            { x: 0, y: 2.58, z: 0 }
        );
        topRail.rotation.z = Math.PI / 2;

        const cassette = this.createCylinder(
            0.245,
            2.25,
            metal,
            { x: 0, y: -1.98, z: 0.02 }
        );
        cassette.rotation.z = Math.PI / 2;

        const cassetteFront = this.createBox(
            2.12,
            0.26,
            0.42,
            darkMetal,
            { x: 0, y: -1.93, z: 0.08 }
        );
        cassetteFront.rotation.x = degreesToRadians(-6);

        const rearPole = this.createCylinder(
            0.045,
            4.22,
            darkMetal,
            { x: 0, y: 0.18, z: -0.17 }
        );
        rearPole.position.z = -0.18;

        const leftFoot = this.createBox(
            0.78,
            0.12,
            1.02,
            metal,
            { x: -0.5, y: -2.2, z: 0.18 }
        );
        leftFoot.rotation.y = degreesToRadians(-7);

        const rightFoot = this.createBox(
            0.78,
            0.12,
            1.02,
            metal,
            { x: 0.5, y: -2.2, z: 0.18 }
        );
        rightFoot.rotation.y = degreesToRadians(7);

        this.addGroundShadow(1.72, 0.72, -2.28);
        this.root.position.y = -0.05;
    }

    buildNotebook(frontTextureSource, backTextureSource) {
        const leather = new THREE.MeshStandardMaterial({
            color: 0x0f332f,
            metalness: 0.08,
            roughness: 0.76
        });
        const strapLeather = new THREE.MeshStandardMaterial({
            color: 0x102f2b,
            metalness: 0.06,
            roughness: 0.8
        });
        const pageMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e4d8,
            metalness: 0.01,
            roughness: 0.82
        });
        const frontArtworkMaterial = new THREE.MeshBasicMaterial({
            color: 0xd4dbd7,
            transparent: true,
            opacity: 0,
            alphaTest: 0.025,
            depthWrite: true,
            toneMapped: false
        });
        const backArtworkMaterial = new THREE.MeshBasicMaterial({
            color: 0xd4dbd7,
            transparent: true,
            opacity: 0,
            alphaTest: 0.025,
            depthWrite: true,
            toneMapped: false
        });
        const strapArtworkMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4dbd7,
            transparent: true,
            opacity: 0,
            alphaTest: 0.025,
            metalness: 0.04,
            roughness: 0.72
        });
        const strapMountArtworkMaterial = strapArtworkMaterial.clone();
        const closurePlate = new THREE.MeshStandardMaterial({
            color: 0xe1ddd4,
            metalness: 0.65,
            roughness: 0.3
        });

        this.createRoundedBox(
            1.98,
            3.06,
            0.18,
            0.13,
            pageMaterial,
            null,
            null,
            { x: 0, y: 0, z: 0 },
            0.018
        );

        this.createRoundedBox(
            2.16,
            3.28,
            0.27,
            0.16,
            leather,
            null,
            null,
            { x: 0, y: 0, z: 0 },
            0.035
        );

        this.createRoundedPanel(
            2.485,
            3.428,
            0.16,
            frontArtworkMaterial,
            { x: 0, y: 0, z: 0.188 }
        );

        const backArtwork = this.createRoundedPanel(
            2.464,
            3.493,
            0.16,
            backArtworkMaterial,
            { x: 0, y: 0, z: -0.188 }
        );
        backArtwork.rotation.y = Math.PI;

        this.createRoundedBox(
            0.58,
            0.42,
            0.075,
            0.07,
            strapLeather,
            strapMountArtworkMaterial,
            null,
            { x: 0.39, y: 0.03, z: 0.23 },
            0.016
        );

        this.createRoundedBox(
            1.22,
            0.3,
            0.085,
            0.055,
            strapLeather,
            strapArtworkMaterial,
            null,
            { x: 0.7, y: 0.03, z: 0.245 },
            0.014
        );

        this.createRoundedBox(
            0.48,
            0.34,
            0.075,
            0.06,
            strapLeather,
            null,
            null,
            { x: 1.04, y: 0.03, z: -0.23 },
            0.014
        );

        this.createRoundedBox(
            0.46,
            0.23,
            0.045,
            0.035,
            closurePlate,
            null,
            null,
            { x: 0.39, y: 0.03, z: 0.325 },
            0.009
        );

        this.loadTexture(frontTextureSource, (texture) => {
            frontArtworkMaterial.map = texture;
            frontArtworkMaterial.opacity = 1;
            frontArtworkMaterial.needsUpdate = true;

            strapArtworkMaterial.map = this.createCroppedTexture(
                texture,
                notebookArtworkRegions.strap,
                "#102f2b"
            );
            strapArtworkMaterial.opacity = 1;
            strapArtworkMaterial.needsUpdate = true;

            strapMountArtworkMaterial.map = this.createCroppedTexture(
                texture,
                notebookArtworkRegions.strapMount,
                "#102f2b"
            );
            strapMountArtworkMaterial.opacity = 1;
            strapMountArtworkMaterial.needsUpdate = true;
        });

        this.loadTexture(backTextureSource, (texture) => {
            backArtworkMaterial.map = texture;
            backArtworkMaterial.opacity = 1;
            backArtworkMaterial.needsUpdate = true;
        });

        this.addGroundShadow(1.35, 0.76, -1.82);
        this.root.position.y = -0.02;
        this.root.scale.setScalar(1.06);
    }

    buildBallPen() {
        const greenMetal = new THREE.MeshStandardMaterial({
            color: 0x73b800,
            metalness: 0.72,
            roughness: 0.24
        });
        const chrome = this.createMetalMaterial(0xd7dbe0);
        const darkChrome = this.createMetalMaterial(0x525a61);
        const blackRubber = new THREE.MeshStandardMaterial({
            color: 0x15191d,
            metalness: 0.16,
            roughness: 0.48
        });

        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.145, 0.125, 3.65, 48, 1, false),
            greenMetal
        );
        barrel.position.y = -0.02;
        barrel.castShadow = true;
        barrel.receiveShadow = true;
        this.root.add(barrel);

        const topCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.18, 0.48, 48),
            chrome
        );
        topCap.position.y = 2.04;
        topCap.castShadow = true;
        this.root.add(topCap);

        this.createCylinder(0.13, 0.08, darkChrome, { x: 0, y: -1.89, z: 0 });
        this.createCylinder(0.12, 0.25, blackRubber, { x: 0, y: -2.055, z: 0 });

        const clip = this.createBox(
            0.055,
            1.14,
            0.055,
            chrome,
            { x: 0.16, y: 1.26, z: 0.11 }
        );
        clip.rotation.z = degreesToRadians(-2.5);
        this.createBox(0.24, 0.1, 0.12, chrome, { x: 0.08, y: 1.82, z: 0.055 });

        const clipTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 24, 16),
            chrome
        );
        clipTip.scale.set(0.48, 1, 0.42);
        clipTip.position.set(0.18, 0.7, 0.12);
        clipTip.castShadow = true;
        this.root.add(clipTip);

        const labelMaterial = new THREE.MeshBasicMaterial({
            map: this.createPenLabelTexture(),
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(0.31, 1.75),
            labelMaterial
        );
        label.position.set(-0.015, 0.1, 0.146);
        this.root.add(label);

        this.addGroundShadow(0.52, 0.38, -2.23);
        this.root.position.y = -0.02;
        this.root.scale.setScalar(1.08);
    }

    buildCollapsibleBooth(textureSource) {
        const frontMaterial = this.createArtworkMaterial();
        const leftMaterial = this.createArtworkMaterial();
        const rightMaterial = this.createArtworkMaterial();
        const headerFrontMaterial = this.createArtworkMaterial({
            roughness: 0.5
        });
        const boothShellMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f2f3,
            metalness: 0.2,
            roughness: 0.42
        });
        const boothBackMaterial = new THREE.MeshStandardMaterial({
            color: 0xd9dee2,
            metalness: 0.24,
            roughness: 0.46
        });
        const headerSideMaterial = new THREE.MeshStandardMaterial({
            color: 0xe5e9ec,
            metalness: 0.22,
            roughness: 0.42
        });
        const metal = this.createMetalMaterial(0xc7cfd7);

        this.createRoundedBox(
            2.2,
            1.88,
            0.82,
            0.2,
            boothShellMaterial,
            frontMaterial,
            boothBackMaterial,
            { x: 0, y: -0.76, z: 0 },
            0.045
        );

        this.createRoundedBox(
            2.36,
            0.18,
            0.94,
            0.075,
            boothShellMaterial,
            boothShellMaterial,
            boothBackMaterial,
            { x: 0, y: 0.24, z: -0.01 },
            0.028
        );

        this.createRoundedBox(
            2.28,
            0.16,
            0.88,
            0.065,
            boothShellMaterial,
            boothShellMaterial,
            boothBackMaterial,
            { x: 0, y: -1.75, z: 0 },
            0.024
        );

        this.createRoundedBox(
            2.14,
            0.7,
            0.19,
            0.07,
            headerSideMaterial,
            headerFrontMaterial,
            headerSideMaterial,
            { x: 0, y: 1.62, z: -0.02 },
            0.025
        );

        [-0.66, 0.66].forEach((poleX) => {
            this.createCylinder(
                0.035,
                1.24,
                metal,
                { x: poleX, y: 0.87, z: -0.16 }
            );
        });

        const leftPanel = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7, 1.58),
            leftMaterial
        );
        leftPanel.position.set(-1.146, -0.76, 0);
        leftPanel.rotation.y = -Math.PI / 2;
        leftPanel.castShadow = true;
        this.root.add(leftPanel);

        const rightPanel = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7, 1.58),
            rightMaterial
        );
        rightPanel.position.set(1.146, -0.76, 0);
        rightPanel.rotation.y = Math.PI / 2;
        rightPanel.castShadow = true;
        this.root.add(rightPanel);

        this.loadTexture(textureSource, (texture) => {
            frontMaterial.map = this.createCroppedTexture(
                texture,
                boothArtworkRegions.front,
                "#e7f1f7"
            );
            leftMaterial.map = this.createCroppedTexture(
                texture,
                boothArtworkRegions.left,
                "#dbeaf4"
            );
            rightMaterial.map = this.createCroppedTexture(
                texture,
                boothArtworkRegions.right,
                "#dbeaf4"
            );
            headerFrontMaterial.map = this.createCroppedTexture(
                texture,
                boothArtworkRegions.header,
                "#7fb64f"
            );
            frontMaterial.needsUpdate = true;
            leftMaterial.needsUpdate = true;
            rightMaterial.needsUpdate = true;
            headerFrontMaterial.needsUpdate = true;
            texture.dispose();
        });

        this.addGroundShadow(1.55, 0.72, -1.92);
        this.root.position.y = 0.04;
        this.root.scale.setScalar(1.14);
    }

    disposeRoot() {
        const textures = new Set();

        while (this.root.children.length) {
            const child = this.root.children.pop();
            child.traverse((object) => {
                object.geometry?.dispose();
                const materials = Array.isArray(object.material)
                    ? object.material
                    : [object.material];

                materials.filter(Boolean).forEach((material) => {
                    if (material.map) textures.add(material.map);
                    material.dispose();
                });
            });
        }

        textures.forEach((texture) => texture.dispose());
        this.root.position.set(0, 0, 0);
        this.root.scale.set(1, 1, 1);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
