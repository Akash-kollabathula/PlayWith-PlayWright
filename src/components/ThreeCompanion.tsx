import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Sparkles, Trophy, Volume2, VolumeX, Eye, Shirt, Smile } from 'lucide-react';
import { UserProfile } from '../types';

interface ThreeCompanionProps {
  user: UserProfile;
  onUpdateCompanion: (updates: Partial<UserProfile['companion']>) => void;
  actionState?: 'idle' | 'running' | 'success' | 'fail';
  compact?: boolean;
}

export const ThreeCompanion: React.FC<ThreeCompanionProps> = ({
  user,
  onUpdateCompanion,
  actionState = 'idle',
  compact = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const companionStateRef = useRef({
    type: user.companion.type,
    accessory: user.companion.accessory,
    actionState: actionState,
    hovered: false,
    petCount: 0
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [petNotice, setPetNotice] = useState<string | null>(null);

  // Keep ref up to date
  useEffect(() => {
    companionStateRef.current.type = user.companion.type;
    companionStateRef.current.accessory = user.companion.accessory;
    companionStateRef.current.actionState = actionState;
  }, [user.companion.type, user.companion.accessory, actionState]);

  // Audio chirp feedback procedurally with Web Audio API (zero 404s)
  const playChirp = (kind: 'pet' | 'cheer' | 'think') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (kind === 'pet') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (kind === 'cheer') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        osc.frequency.setValueAtTime(660, now + 0.13);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio context might require user interaction first
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // 1. Software-WebGL Guard probe
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = null; // transparent background

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.35, 4.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting Rig (3-point)
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.8);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 512;
      keyLight.shadow.mapSize.height = 512;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 12;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // Ground Contact Shadow & Neon Hologram Pedestal
    const groundGroup = new THREE.Group();
    groundGroup.position.y = -0.7;

    // Contact shadow
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    groundGroup.add(shadowMesh);

    // Hologram Disc with glowing ring
    const discGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.08, 32);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.receiveShadow = !isSoftwareGl;
    groundGroup.add(discMesh);

    const ringGeo = new THREE.RingGeometry(1.15, 1.25, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.045;
    groundGroup.add(ringMesh);

    scene.add(groundGroup);

    // ROOT COMPANION GROUP
    const companionRoot = new THREE.Group();
    companionRoot.position.y = -0.65;
    scene.add(companionRoot);

    // Reference parts for animation
    let bodyGroup: THREE.Group = new THREE.Group();
    let headGroup: THREE.Group = new THREE.Group();
    let tailGroup: THREE.Group = new THREE.Group();
    let leftArm: THREE.Group = new THREE.Group();
    let rightArm: THREE.Group = new THREE.Group();
    let earsGroup: THREE.Group = new THREE.Group();
    let accessoryMesh: THREE.Object3D | null = null;
    let holoKeyboard: THREE.Group = new THREE.Group();

    // Helper to build accessories
    const createAccessory = (type: string): THREE.Object3D | null => {
      if (type === 'none') return null;
      const group = new THREE.Group();

      if (type === 'visor') {
        const visorGeo = new THREE.CylinderGeometry(0.32, 0.34, 0.12, 16, 1, false, -Math.PI / 2, Math.PI);
        const visorMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.85
        });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.rotation.z = Math.PI / 2;
        visor.rotation.x = Math.PI / 2;
        visor.position.set(0, 0.05, 0.32);
        group.add(visor);
      } else if (type === 'gradcap') {
        const capBaseGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.12, 16);
        const capBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.7 });
        const capBase = new THREE.Mesh(capBaseGeo, capBaseMat);
        capBase.position.y = 0.35;
        group.add(capBase);

        const capTopGeo = new THREE.BoxGeometry(0.65, 0.03, 0.65);
        const capTop = new THREE.Mesh(capTopGeo, capBaseMat);
        capTop.position.y = 0.42;
        group.add(capTop);

        const tasselGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
        const tasselMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
        const tassel = new THREE.Mesh(tasselGeo, tasselMat);
        tassel.position.set(0.3, 0.3, 0);
        group.add(tassel);
      } else if (type === 'crown') {
        const crownGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.2, 5);
        const crownMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.2
        });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.y = 0.45;
        group.add(crown);
      } else if (type === 'wizard') {
        const coneGeo = new THREE.ConeGeometry(0.32, 0.6, 16);
        const coneMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.6 });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.y = 0.58;
        cone.rotation.z = -0.1;
        group.add(cone);

        const brimGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.03, 20);
        const brim = new THREE.Mesh(brimGeo, coneMat);
        brim.position.y = 0.34;
        group.add(brim);
      }
      return group;
    };

    // Holographic mini keyboard for "running" tests
    const buildHoloKeyboard = () => {
      const kbGroup = new THREE.Group();
      const kbBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.04, 0.45),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.75
        })
      );
      kbGroup.add(kbBase);

      // Key grids
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          const key = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.02, 0.09),
            new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
          );
          key.position.set(-0.35 + c * 0.14, 0.03, -0.12 + r * 0.12);
          kbGroup.add(key);
        }
      }
      kbGroup.position.set(0, 0.45, 0.65);
      kbGroup.rotation.x = 0.35;
      kbGroup.visible = false;
      return kbGroup;
    };

    holoKeyboard = buildHoloKeyboard();
    companionRoot.add(holoKeyboard);

    // Model Construction by Type
    const buildModel = (type: 'fox' | 'panda' | 'owl', accessory: string) => {
      // Clear previous companion meshes
      while (companionRoot.children.length > 0) {
        companionRoot.remove(companionRoot.children[0]);
      }
      companionRoot.add(holoKeyboard);

      bodyGroup = new THREE.Group();
      headGroup = new THREE.Group();
      tailGroup = new THREE.Group();
      leftArm = new THREE.Group();
      rightArm = new THREE.Group();
      earsGroup = new THREE.Group();

      if (type === 'fox') {
        // --- CYBER FOX (Kitsune QA) ---
        const orangeMat = new THREE.MeshStandardMaterial({ color: 0xe05615, roughness: 0.45, metalness: 0.15 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });

        // Body: stylized organic torso
        const torsoGeo = new THREE.CapsuleGeometry(0.38, 0.48, 8, 16);
        const torso = new THREE.Mesh(torsoGeo, orangeMat);
        torso.position.y = 0.55;
        torso.castShadow = !isSoftwareGl;
        bodyGroup.add(torso);

        // Chest white fur patch
        const chestGeo = new THREE.SphereGeometry(0.32, 16, 12);
        chestGeo.scale(0.8, 1, 0.4);
        const chest = new THREE.Mesh(chestGeo, whiteMat);
        chest.position.set(0, 0.58, 0.24);
        bodyGroup.add(chest);

        // Head Group
        headGroup.position.set(0, 1.05, 0.05);

        const headGeo = new THREE.SphereGeometry(0.42, 18, 16);
        const headMesh = new THREE.Mesh(headGeo, orangeMat);
        headMesh.castShadow = !isSoftwareGl;
        headGroup.add(headMesh);

        // Snout
        const snoutGeo = new THREE.ConeGeometry(0.2, 0.38, 14);
        const snout = new THREE.Mesh(snoutGeo, whiteMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, -0.05, 0.42);
        headGroup.add(snout);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), darkMat);
        nose.position.set(0, -0.05, 0.62);
        headGroup.add(nose);

        // Eyes (expressive shiny beads)
        const eyeGeo = new THREE.SphereGeometry(0.065, 10, 10);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.16, 0.08, 0.35);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.16, 0.08, 0.35);
        headGroup.add(leftEye, rightEye);

        // Cheeks fluff
        const cheekGeo = new THREE.ConeGeometry(0.14, 0.22, 8);
        const leftCheek = new THREE.Mesh(cheekGeo, whiteMat);
        leftCheek.rotation.z = Math.PI / 2.6;
        leftCheek.position.set(-0.38, -0.08, 0.15);
        const rightCheek = new THREE.Mesh(cheekGeo, whiteMat);
        rightCheek.rotation.z = -Math.PI / 2.6;
        rightCheek.position.set(0.38, -0.08, 0.15);
        headGroup.add(leftCheek, rightCheek);

        // Ears with inner pinkish tint
        const earGeo = new THREE.ConeGeometry(0.18, 0.42, 8);
        const leftEar = new THREE.Mesh(earGeo, orangeMat);
        leftEar.position.set(-0.25, 0.42, 0);
        leftEar.rotation.z = -0.22;
        const rightEar = new THREE.Mesh(earGeo, orangeMat);
        rightEar.position.set(0.25, 0.42, 0);
        rightEar.rotation.z = 0.22;
        earsGroup.add(leftEar, rightEar);
        headGroup.add(earsGroup);

        // Bushy Tail (articulated chain)
        tailGroup.position.set(0, 0.3, -0.32);
        const tailSegments = 4;
        let prevTailPart: THREE.Object3D = tailGroup;
        for (let i = 0; i < tailSegments; i++) {
          const tRadius = 0.18 - i * 0.02;
          const tGeo = new THREE.SphereGeometry(tRadius, 10, 8);
          const tMat = i === tailSegments - 1 ? whiteMat : orangeMat;
          const part = new THREE.Mesh(tGeo, tMat);
          part.position.set(0, 0.14, -0.12);
          prevTailPart.add(part);
          prevTailPart = part;
        }

        // Paws / Arms
        const pawGeo = new THREE.CapsuleGeometry(0.1, 0.28, 6, 8);
        leftArm.position.set(-0.35, 0.55, 0.15);
        const lPaw = new THREE.Mesh(pawGeo, darkMat);
        leftArm.add(lPaw);

        rightArm.position.set(0.35, 0.55, 0.15);
        const rPaw = new THREE.Mesh(pawGeo, darkMat);
        rightArm.add(rPaw);

        // Back Feet
        const feetGeo = new THREE.SphereGeometry(0.14, 8, 8);
        feetGeo.scale(1, 0.7, 1.4);
        const lFoot = new THREE.Mesh(feetGeo, darkMat);
        lFoot.position.set(-0.3, 0.1, 0.15);
        const rFoot = new THREE.Mesh(feetGeo, darkMat);
        rFoot.position.set(0.3, 0.1, 0.15);
        bodyGroup.add(lFoot, rFoot);

        bodyGroup.add(leftArm, rightArm, tailGroup, headGroup);
        companionRoot.add(bodyGroup);

      } else if (type === 'panda') {
        // --- ROBO PANDA (Panda Inspector) ---
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const cyanMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.6 });

        // Round Panda Body
        const torsoGeo = new THREE.SphereGeometry(0.48, 16, 16);
        torsoGeo.scale(1, 1.1, 0.95);
        const torso = new THREE.Mesh(torsoGeo, whiteMat);
        torso.position.y = 0.55;
        bodyGroup.add(torso);

        // Core chest reactor / Playwright badge
        const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), cyanMat);
        badge.rotation.x = Math.PI / 2;
        badge.position.set(0, 0.65, 0.42);
        bodyGroup.add(badge);

        // Head Group
        headGroup.position.set(0, 1.15, 0);
        const headGeo = new THREE.SphereGeometry(0.44, 16, 16);
        const headMesh = new THREE.Mesh(headGeo, whiteMat);
        headGroup.add(headMesh);

        // Black eye patches
        const patchGeo = new THREE.SphereGeometry(0.14, 10, 10);
        patchGeo.scale(0.9, 1.2, 0.4);
        const leftPatch = new THREE.Mesh(patchGeo, blackMat);
        leftPatch.position.set(-0.18, 0.05, 0.38);
        leftPatch.rotation.z = 0.3;
        const rightPatch = new THREE.Mesh(patchGeo, blackMat);
        rightPatch.position.set(0.18, 0.05, 0.38);
        rightPatch.rotation.z = -0.3;
        headGroup.add(leftPatch, rightPatch);

        // Shiny eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
        leftEye.position.set(-0.18, 0.06, 0.42);
        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
        rightEye.position.set(0.18, 0.06, 0.42);
        headGroup.add(leftEye, rightEye);

        // Panda Muzzle
        const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), whiteMat);
        muzzle.scale.set(1.1, 0.7, 0.8);
        muzzle.position.set(0, -0.08, 0.4);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), blackMat);
        nose.position.set(0, -0.05, 0.48);
        headGroup.add(muzzle, nose);

        // Panda round black ears
        const earGeo = new THREE.SphereGeometry(0.16, 10, 10);
        const leftEar = new THREE.Mesh(earGeo, blackMat);
        leftEar.position.set(-0.35, 0.35, 0);
        const rightEar = new THREE.Mesh(earGeo, blackMat);
        rightEar.position.set(0.35, 0.35, 0);
        earsGroup.add(leftEar, rightEar);
        headGroup.add(earsGroup);

        // Black arms
        const armGeo = new THREE.CapsuleGeometry(0.14, 0.34, 8, 8);
        leftArm.position.set(-0.46, 0.65, 0.15);
        leftArm.add(new THREE.Mesh(armGeo, blackMat));
        rightArm.position.set(0.46, 0.65, 0.15);
        rightArm.add(new THREE.Mesh(armGeo, blackMat));

        // Feet
        const footGeo = new THREE.SphereGeometry(0.18, 10, 8);
        footGeo.scale(1, 0.8, 1.3);
        const lFoot = new THREE.Mesh(footGeo, blackMat);
        lFoot.position.set(-0.32, 0.12, 0.2);
        const rFoot = new THREE.Mesh(footGeo, blackMat);
        rFoot.position.set(0.32, 0.12, 0.2);
        bodyGroup.add(lFoot, rFoot);

        bodyGroup.add(leftArm, rightArm, headGroup);
        companionRoot.add(bodyGroup);

      } else {
        // --- CYBER OWL (Owly Assert) ---
        const blueMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 });
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
        const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

        // Egg-shaped body
        const owlBodyGeo = new THREE.SphereGeometry(0.46, 16, 16);
        owlBodyGeo.scale(0.9, 1.25, 0.85);
        const owlBody = new THREE.Mesh(owlBodyGeo, blueMat);
        owlBody.position.y = 0.6;
        bodyGroup.add(owlBody);

        // Feather breast plate
        const breastGeo = new THREE.SphereGeometry(0.32, 12, 12);
        breastGeo.scale(0.85, 1.1, 0.4);
        const breast = new THREE.Mesh(breastGeo, whiteMat);
        breast.position.set(0, 0.55, 0.28);
        bodyGroup.add(breast);

        // Owl Head (can rotate 360 degrees!)
        headGroup.position.set(0, 1.15, 0);
        const headGeo = new THREE.SphereGeometry(0.44, 16, 14);
        headGroup.add(new THREE.Mesh(headGeo, blueMat));

        // Huge round owl eyes
        const eyeRimGeo = new THREE.TorusGeometry(0.14, 0.03, 8, 20);
        const leftRim = new THREE.Mesh(eyeRimGeo, yellowMat);
        leftRim.position.set(-0.18, 0.05, 0.36);
        const rightRim = new THREE.Mesh(eyeRimGeo, yellowMat);
        rightRim.position.set(0.18, 0.05, 0.36);
        headGroup.add(leftRim, rightRim);

        const leftEyePupil = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), eyeGlowMat);
        leftEyePupil.position.set(-0.18, 0.05, 0.34);
        const rightEyePupil = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), eyeGlowMat);
        rightEyePupil.position.set(0.18, 0.05, 0.34);
        headGroup.add(leftEyePupil, rightEyePupil);

        // Curved beak
        const beakGeo = new THREE.ConeGeometry(0.08, 0.22, 8);
        const beak = new THREE.Mesh(beakGeo, yellowMat);
        beak.rotation.x = Math.PI / 1.7;
        beak.position.set(0, -0.08, 0.44);
        headGroup.add(beak);

        // Ear feather tufts
        const tuftGeo = new THREE.ConeGeometry(0.1, 0.3, 6);
        const leftTuft = new THREE.Mesh(tuftGeo, blueMat);
        leftTuft.position.set(-0.25, 0.4, 0.1);
        leftTuft.rotation.z = -0.3;
        const rightTuft = new THREE.Mesh(tuftGeo, blueMat);
        rightTuft.position.set(0.25, 0.4, 0.1);
        rightTuft.rotation.z = 0.3;
        earsGroup.add(leftTuft, rightTuft);
        headGroup.add(earsGroup);

        // Articulated Wings (arms)
        const wingGeo = new THREE.BoxGeometry(0.12, 0.6, 0.35);
        leftArm.position.set(-0.46, 0.65, 0);
        leftArm.add(new THREE.Mesh(wingGeo, blueMat));
        rightArm.position.set(0.46, 0.65, 0);
        rightArm.add(new THREE.Mesh(wingGeo, blueMat));

        // Talons
        const talonMat = yellowMat;
        const lTalon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6), talonMat);
        lTalon.rotation.x = Math.PI / 2;
        lTalon.position.set(-0.18, 0.08, 0.2);
        const rTalon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6), talonMat);
        rTalon.rotation.x = Math.PI / 2;
        rTalon.position.set(0.18, 0.08, 0.2);
        bodyGroup.add(lTalon, rTalon);

        bodyGroup.add(leftArm, rightArm, headGroup);
        companionRoot.add(bodyGroup);
      }

      // Add accessory to head
      if (accessory && accessory !== 'none') {
        accessoryMesh = createAccessory(accessory);
        if (accessoryMesh) {
          headGroup.add(accessoryMesh);
        }
      }
    };

    // Initial build
    buildModel(user.companion.type, user.companion.accessory);

    // Watch for accessory/type changes
    let currentType = user.companion.type;
    let currentAccessory = user.companion.accessory;

    // Mouse / Touch Interaction for petting
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Pet click handler
    const handleClick = () => {
      companionStateRef.current.petCount++;
      playChirp('pet');
      setPetNotice(`Petted! +5 XP 💖`);
      setTimeout(() => setPetNotice(null), 1400);

      onUpdateCompanion({
        xp: user.companion.xp + 5,
        mood: 'happy'
      });
    };
    container.addEventListener('click', handleClick);

    // Animation variables
    let frameId = 0;
    const clock = new THREE.Clock();
    let jumpTime = 0;

    // Software GL loop pacing helper
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const animate = () => {
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      // Check if type/accessory changed
      if (companionStateRef.current.type !== currentType || companionStateRef.current.accessory !== currentAccessory) {
        currentType = companionStateRef.current.type;
        currentAccessory = companionStateRef.current.accessory;
        buildModel(currentType, currentAccessory);
      }

      const activeState = companionStateRef.current.actionState;

      // Holographic Keyboard Visibility
      if (activeState === 'running') {
        holoKeyboard.visible = true;
        holoKeyboard.position.y = 0.45 + Math.sin(t * 8) * 0.02;
      } else {
        holoKeyboard.visible = false;
      }

      // Natural Breathing & Gentle Floating
      const breath = Math.sin(t * 2.8) * 0.03;
      bodyGroup.position.y = breath;

      // Head tracking towards cursor with spring damp
      const targetHeadY = mouseX * 0.35;
      const targetHeadX = -mouseY * 0.25;
      headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, targetHeadY, 5, dt);
      headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, targetHeadX, 5, dt);

      // Tail Wagging (for Fox)
      if (currentType === 'fox' && tailGroup) {
        tailGroup.rotation.y = Math.sin(t * 6) * 0.4;
        tailGroup.rotation.z = Math.cos(t * 3) * 0.15;
      }

      // Ear Twitches
      if (earsGroup) {
        earsGroup.rotation.z = Math.sin(t * 1.5) > 0.8 ? Math.sin(t * 25) * 0.15 : 0;
      }

      // State specific animations
      if (activeState === 'running') {
        // Typing furiously on holo keyboard!
        leftArm.rotation.x = -0.7 + Math.sin(t * 22) * 0.25;
        rightArm.rotation.x = -0.7 + Math.cos(t * 22) * 0.25;
        companionRoot.rotation.y = THREE.MathUtils.damp(companionRoot.rotation.y, 0, 6, dt);
      } else if (activeState === 'success') {
        // Victory jump & celebratory cheer spin!
        jumpTime += dt * 4;
        const jumpY = Math.abs(Math.sin(jumpTime * 3)) * 0.55;
        companionRoot.position.y = -0.65 + jumpY;
        companionRoot.rotation.y += dt * 4;
        leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, -2.2, 8, dt);
        rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -2.2, 8, dt);
      } else if (activeState === 'fail') {
        // Sympathetic head tilt & thinking pose
        jumpTime = 0;
        companionRoot.position.y = -0.65;
        companionRoot.rotation.y = THREE.MathUtils.damp(companionRoot.rotation.y, 0.2, 4, dt);
        headGroup.rotation.z = THREE.MathUtils.damp(headGroup.rotation.z, 0.35, 5, dt);
        leftArm.rotation.x = -0.2;
        rightArm.rotation.x = -1.1; // chin scratch
      } else {
        // Idle
        jumpTime = 0;
        companionRoot.position.y = -0.65;
        companionRoot.rotation.y = THREE.MathUtils.damp(companionRoot.rotation.y, Math.sin(t * 0.6) * 0.18, 3, dt);
        leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 5, dt);
        rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 5, dt);
        headGroup.rotation.z = THREE.MathUtils.damp(headGroup.rotation.z, 0, 5, dt);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    };

    animate();

    // Window resize observer
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const companionTypes: { type: 'fox' | 'panda' | 'owl'; label: string; icon: string }[] = [
    { type: 'fox', label: 'Cyber Fox', icon: '🦊' },
    { type: 'panda', label: 'Robo Panda', icon: '🐼' },
    { type: 'owl', label: 'Wise Owl', icon: '🦉' }
  ];

  const accessories: { id: UserProfile['companion']['accessory']; label: string }[] = [
    { id: 'none', label: 'Classic' },
    { id: 'visor', label: 'Cyber Visor' },
    { id: 'gradcap', label: 'Graduation Cap' },
    { id: 'crown', label: 'Gold Crown' },
    { id: 'wizard', label: 'Wizard Hat' }
  ];

  return (
    <div className={`relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl ${compact ? 'p-3' : 'p-4'}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-lg shadow-sm">
            {user.companion.type === 'fox' ? '🦊' : user.companion.type === 'panda' ? '🐼' : '🦉'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-slate-100">{user.companion.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-medium">
                Lv.{user.companion.level}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>{user.companion.xp} XP</span>
              <span className="text-slate-600">•</span>
              <span className="capitalize text-cyan-400">{actionState === 'running' ? '⚡ Testing...' : actionState === 'success' ? '🎉 Passed!' : actionState === 'fail' ? '🤔 Analyzing...' : 'Ready for test'}</span>
            </div>
          </div>
        </div>

        {/* Audio chirp button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          title={soundEnabled ? 'Mute companion chirps' : 'Enable sound'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* 3D Canvas Mount Point */}
      <div className="relative w-full h-44 sm:h-52 flex items-center justify-center bg-gradient-to-b from-slate-950/60 to-slate-900/80 rounded-xl border border-slate-800/80 cursor-pointer group">
        <div ref={mountRef} className="w-full h-full" />

        {/* Pet notification toast overlay */}
        {petNotice && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-pink-500/90 text-white font-medium text-xs rounded-full shadow-lg animate-bounce pointer-events-none">
            {petNotice}
          </div>
        )}

        {/* Hover Hint */}
        <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Click companion to pet & gain XP!
        </div>
      </div>

      {/* Companion Controls Bar */}
      {!compact && (
        <div className="mt-3 flex flex-col gap-2">
          {/* Switch Mascot */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Smile size={12} /> Mascot
            </span>
            <div className="flex gap-1">
              {companionTypes.map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    onUpdateCompanion({
                      type: item.type,
                      name: item.type === 'fox' ? 'Kitsune QA' : item.type === 'panda' ? 'Panda Inspector' : 'Owly Assert'
                    });
                    playChirp('cheer');
                  }}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition ${
                    user.companion.type === item.type
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Switch Accessory */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Shirt size={12} /> Hat / Gear
            </span>
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-[200px] sm:max-w-none">
              {accessories.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    onUpdateCompanion({ accessory: acc.id });
                    playChirp('pet');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition ${
                    user.companion.accessory === acc.id
                      ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
