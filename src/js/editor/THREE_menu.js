import JSLog from '../JSLog'
import * as THREE from 'three'

JSLog('module loaded', 'THREE_menu')

let camera, scene, renderer
let geometry, material, mesh, light, light1
let isAnimate = true

function init () {
  // RENDERER
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('menu_canvas'), antialias: true })
  renderer.setClearColor(0x282828)

  // CAMERA
  camera = new THREE.PerspectiveCamera(10, 1, 0.1, 3000)

  // SCENE
  scene = new THREE.Scene()

  // LIGHTS
  light = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(light)

  light1 = new THREE.PointLight(0xffffff, 0.5)
  scene.add(light1)

  // OBJECT
  geometry = new THREE.IcosahedronBufferGeometry(85, 1)
  // geometry = new THREE.CubeGeometry(100, 100, 100)

  material = new THREE.MeshLambertMaterial({ color: 0x429db3 })
  mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, -1000)

  scene.add(mesh)
}

function animate () {
  requestAnimationFrame(animate)

  mesh.rotation.x += 0.02
  mesh.rotation.y += 0.02

  renderer.render(scene, camera)
  isAnimate = false
}

export default () => {
  init()
  if (isAnimate) animate()
}
