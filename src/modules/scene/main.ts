/* eslint no-param-reassign: "error" */
import * as THREE from 'three'
import { MeshStandardMaterial, SphereGeometry } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Water } from 'three/examples/jsm/objects/Water2.js'
import { GUI } from 'dat.gui'

const gui = new GUI()

window.addEventListener('DOMContentLoaded', () =>
{
  const hdrTextureURL = new URL('./hdr/sea_4k.hdr', import.meta.url)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  const container = document.querySelector('.container-scene') as HTMLElement

  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000)
  const orbit = new OrbitControls(camera, renderer.domElement)
  const light = new THREE.AmbientLight(0x404040)
  scene.add(light)

  camera.position.set(0, 70, 50)
  orbit.maxDistance = 1000
  orbit.minAzimuthAngle = 0
  orbit.maxPolarAngle = 1.4708

  orbit.update()

  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.8

  // gui
  // const cameraFolder = gui.addFolder('Camera')
  // cameraFolder.add(camera.position, 'z', 100)
  // cameraFolder.add(camera.position, 'y', 100)
  // cameraFolder.add(camera.position, 'x', 100)
  // cameraFolder.open()

  // loader enviroment
  const loader = new RGBELoader()
  loader.load(hdrTextureURL.toString(), (texture) =>
  {
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture
    scene.environment = texture
  })

  // loader model
  const modelLoader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()

  dracoLoader.setDecoderPath('three/examples/js/libs/draco/')
  modelLoader.setDRACOLoader(dracoLoader)

  modelLoader.load(
    'models/aleksandr_frigate/scene.gltf',
    // called when the resource is loaded
    (gltf) =>
    {
      gltf.scene.position.set(0, 2, 0)
      // gltf.scene.rotateX(-Math.PI / 2)
      scene.add(gltf.scene)
    },
  )

  const waterGeo = new THREE.PlaneGeometry(5000, 5000)
  waterGeo.rotateX(-Math.PI / 2)

  const water = new Water(waterGeo, {
    color: 0xccc999,
    scale: 5,
    flowDirection: new THREE.Vector2(0.5, -0.5),
    textureWidth: 256,
    textureHeight: 256,
  })

  water.material.transparent = true
  water.material.opacity = 0.5
  scene.add(water)

  function animate()
  {
    renderer.render(scene, camera)
  }

  renderer.setAnimationLoop(animate)
  window.addEventListener('resize', () =>
  {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
})
