/** Phaser 3 integration helper. No engine bundled; import in your Phaser project. */
export async function loadDiThuongAssets(scene, base = '/di-thuong/') {
  base = base.endsWith('/') ? base : base + '/';
  const response = await fetch(base + 'manifest.json');
  if (!response.ok) throw new Error('Cannot fetch DiThuong manifest');
  const manifest = await response.json();
  const errors = [];
  const failed = file => errors.push(file.key);
  scene.load.on('loaderror', failed);
  for (const asset of manifest.assets) {
    if (asset.kind === 'map-preview') continue;
    if (asset.atlas) scene.load.atlas(asset.key, base + asset.path, base + asset.atlas);
    else if (asset.kind === 'audio') scene.load.audio(asset.key, base + asset.path);
    else if (asset.path.endsWith('.svg')) scene.load.svg(asset.key, base + asset.path);
    else scene.load.image(asset.key, base + asset.path);
  }
  scene.load.json('dt_animations', base + 'data/animations.json');
  for (const key of ['apartment_3f', 'safe_base', 'courtyard']) {
    scene.load.json('dt_map_' + key, base + 'data/maps/' + key + '.json');
  }
  await new Promise(resolve => { scene.load.once('complete', resolve); scene.load.start(); });
  scene.load.off('loaderror', failed);
  if (errors.length) throw new Error('Failed assets: ' + errors.join(', '));
  for (const animation of scene.cache.json.get('dt_animations')) {
    if (!scene.anims.exists(animation.key)) scene.anims.create({
      key: animation.key,
      frames: animation.frames.map(frame => ({key: animation.texture, frame})),
      frameRate: animation.frameRate, repeat: animation.repeat
    });
  }
  return manifest;
}

export function buildDiThuongMap(scene, key = 'apartment_3f') {
  const map = scene.cache.json.get('dt_map_' + key);
  if (!map) throw new Error('Map not loaded: ' + key);
  const ground = scene.add.container(0, 0).setDepth(-1000);
  for (let r = 0; r < map.rows; r++) for (let c = 0; c < map.cols; c++) {
    ground.add(scene.add.image(c * 64 + 32, r * 48 + 24,
      'floor_tiles_' + String(map.floor[r][c]).padStart(2, '0')).setDisplaySize(64, 48));
  }
  const objects = map.objects.map(o => scene.add.image(o.x, o.y, o.key)
    .setOrigin(o.origin[0], o.origin[1]).setDisplaySize(o.width, o.height)
    .setDepth(o.depth));
  const blockers = scene.physics.add.staticGroup();
  function collider(rect) {
    const zone = scene.add.zone(rect.x + rect.width / 2, rect.y + rect.height / 2,
      rect.width, rect.height);
    blockers.add(zone);
    zone.body.setSize(rect.width, rect.height);
    return zone;
  }
  map.colliders.forEach(collider);
  const doors = map.doors.map(d => ({...d, closed: d.initialState === 'closed', blocker: collider(d.rect)}));
  for (const door of doors) door.blocker.body.enable = door.closed;
  return {
    map, ground, objects, blockers, doors,
    setDoor(id, closed) {
      const d = doors.find(d => d.id === id);
      if (!d) throw new Error('Unknown door: ' + id);
      d.closed = closed; d.blocker.body.enable = closed;
      objects[d.objectIndex].setTexture(closed ? d.closedKey : d.openKey);
    }
  };
}

export function createDiThuongPlayer(scene, x, y, female = false) {
  const texture = female ? 'player_female_walk' : 'player_male_walk';
  const player = scene.physics.add.sprite(x, y, texture, 'south_walk_0')
    .setOrigin(.5, .94).setScale(.5);
  // Local source pixels BEFORE scale: 40x24 -> world foot collider20x12.
  player.body.setSize(40, 24).setOffset(44, 156);
  player.setDepth(y);
  return player;
}

export function setGhostState(sprite, direction, state) {
  if (!['south','west','east','north'].includes(direction) ||
      !['dormant','manifested','pursuing','restrained'].includes(state))
    throw new Error('Invalid ghost direction/state');
  sprite.setFrame(direction + '_' + state).setOrigin(.5, .94).setDepth(sprite.y);
}

// Start with a loading scene's async create():
// await loadDiThuongAssets(this);
// const field = buildDiThuongMap(this);
// const start = field.map.spawns.find(s => s.id === 'player');
// const player = createDiThuongPlayer(this, start.x, start.y);
// this.physics.add.collider(player, field.blockers);
// player.play('player_male_walk_south');
// On each movement update: player.setDepth(player.y);
// On stop: player.anims.stop(); player.setFrame(direction + '_walk_0');
// To inspect: setTexture('player_actions', direction + '_male_interact');
// Restore walking texture before playing a walking animation.
