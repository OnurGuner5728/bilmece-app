extends Node3D

# FLUXLINE
# Portrait, one-thumb 3D magnetic runner. Everything is generated at runtime from
# lightweight meshes so the APK stays self-contained and fast on mid-range Android.

const STATE_MENU := 0
const STATE_PLAYING := 1
const STATE_OVER := 2
const LANE_X := [-2.45, 0.0, 2.45]
const SEGMENT_LENGTH := 12.0
const SEGMENT_COUNT := 18
const PLAYER_Z := 2.4
const SAVE_PATH := "user://fluxline.cfg"

var rng := RandomNumberGenerator.new()
var state := STATE_MENU
var lane := 1
var target_x := 0.0
var speed := 18.0
var distance := 0.0
var score := 0
var run_shards := 0
var total_shards := 0
var best_score := 0
var combo := 1
var combo_timer := 0.0
var charge := 55.0
var shields := 2
var invincible := 0.0
var phase_time := 0.0
var jump_time := 0.0
var jump_duration := 0.72
var near_misses := 0
var mission_done := false
var shake := 0.0
var touch_start := Vector2.ZERO
var touch_started_at := 0
var theme_index := 0
var unlocked_themes := 1

var player: Node3D
var camera: Camera3D
var segments: Array[Node3D] = []
var craft_accent_parts: Array[MeshInstance3D] = []
var craft_body_parts: Array[MeshInstance3D] = []
var phase_shell: MeshInstance3D
var moon: MeshInstance3D

var ui_root: Control
var menu_panel: Control
var hud_panel: Control
var over_panel: Control
var score_label: Label
var combo_label: Label
var shard_label: Label
var shield_label: Label
var speed_label: Label
var mission_label: Label
var charge_bar: ProgressBar
var best_label: Label
var bank_label: Label
var rank_label: Label
var theme_button: Button
var final_score_label: Label
var final_detail_label: Label
var tutorial_label: Label
var flash_rect: ColorRect

var audio_pool: Array[AudioStreamPlayer] = []
var audio_cursor := 0
var sfx_lane: AudioStreamWAV
var sfx_jump: AudioStreamWAV
var sfx_shard: AudioStreamWAV
var sfx_phase: AudioStreamWAV
var sfx_hit: AudioStreamWAV
var music_player: AudioStreamPlayer

var mat_track: StandardMaterial3D
var mat_track_edge: StandardMaterial3D
var mat_city_a: StandardMaterial3D
var mat_city_b: StandardMaterial3D
var mat_window: StandardMaterial3D
var mat_hazard: StandardMaterial3D
var mat_hazard_hot: StandardMaterial3D
var mat_shard: StandardMaterial3D
var mat_white: StandardMaterial3D

var themes := [
	{"name":"CYAN // MAGENTA", "accent":Color("18e7ff"), "accent2":Color("ff3ac8"), "body":Color("11152b")},
	{"name":"SOLAR // VIOLET", "accent":Color("ffb52e"), "accent2":Color("8b5cff"), "body":Color("211126")},
	{"name":"TOXIC // ICE", "accent":Color("7cff4a"), "accent2":Color("73d6ff"), "body":Color("0d1d1d")},
	{"name":"CRIMSON // GOLD", "accent":Color("ff315d"), "accent2":Color("ffd55a"), "body":Color("241016")}
]

func _ready() -> void:
	rng.randomize()
	load_save()
	build_materials()
	build_world()
	build_track()
	build_player()
	build_ui()
	build_audio()
	apply_theme(theme_index)
	show_menu()

func _process(delta: float) -> void:
	if state == STATE_PLAYING:
		update_game(delta)
	else:
		update_attract_mode(delta)
	update_camera(delta)
	update_player_visual(delta)

func _unhandled_input(event: InputEvent) -> void:
	if state != STATE_PLAYING:
		return
	if event is InputEventScreenTouch:
		if event.pressed:
			touch_start = event.position
			touch_started_at = Time.get_ticks_msec()
		else:
			var diff := event.position - touch_start
			var elapsed := float(Time.get_ticks_msec() - touch_started_at) / 1000.0
			if abs(diff.x) > 58.0 and abs(diff.x) > abs(diff.y):
				shift_lane(1 if diff.x > 0.0 else -1)
			elif diff.y < -62.0 and abs(diff.y) > abs(diff.x):
				jump()
			elif elapsed < 0.42 and diff.length() < 55.0:
				activate_phase()

func update_game(delta: float) -> void:
	distance += speed * delta
	speed = min(37.0, 18.0 + distance * 0.0085)
	score = int(distance * 4.2) + run_shards * 35 + near_misses * 70
	invincible = max(0.0, invincible - delta)
	phase_time = max(0.0, phase_time - delta)
	combo_timer = max(0.0, combo_timer - delta)
	if combo_timer <= 0.0:
		combo = 1
	charge = min(100.0, charge + delta * 3.2)

	if jump_time > 0.0:
		jump_time = max(0.0, jump_time - delta)

	player.position.x = lerp(player.position.x, target_x, 1.0 - pow(0.0007, delta))
	move_segments(speed * delta)
	check_interactions()
	update_hud()

	if near_misses >= 5 and not mission_done:
		mission_done = true
		charge = 100.0
		score += 500
		mission_label.text = "MISSION COMPLETE  +500"
		mission_label.modulate = themes[theme_index].accent
		var tw := create_tween()
		tw.tween_property(mission_label, "scale", Vector2(1.08, 1.08), 0.12)
		tw.tween_property(mission_label, "scale", Vector2.ONE, 0.24)

	if Input.is_action_just_pressed("ui_left"):
		shift_lane(-1)
	if Input.is_action_just_pressed("ui_right"):
		shift_lane(1)
	if Input.is_action_just_pressed("ui_up"):
		jump()
	if Input.is_action_just_pressed("ui_accept"):
		activate_phase()

func update_attract_mode(delta: float) -> void:
	move_segments(5.5 * delta)
	if player:
		player.position.x = lerp(player.position.x, sin(Time.get_ticks_msec() * 0.00055) * 0.7, delta * 1.8)

func move_segments(amount: float) -> void:
	var min_z := 99999.0
	for seg in segments:
		seg.position.z += amount
		min_z = min(min_z, seg.position.z)
	for seg in segments:
		if seg.position.z > 13.0:
			seg.position.z = min_z - SEGMENT_LENGTH
			min_z = seg.position.z
			rebuild_segment(seg)

func build_materials() -> void:
	mat_track = make_mat(Color("101424"), Color("07101d"), 0.78, 0.24)
	mat_track_edge = make_mat(Color("0b2b36"), Color("18e7ff"), 0.35, 0.22, 2.9)
	mat_city_a = make_mat(Color("101126"), Color("050617"), 0.45, 0.55)
	mat_city_b = make_mat(Color("17102d"), Color("08051a"), 0.55, 0.5)
	mat_window = make_mat(Color("54246e"), Color("ff3ac8"), 0.25, 0.35, 2.2)
	mat_hazard = make_mat(Color("301226"), Color("ff315d"), 0.42, 0.28, 2.6)
	mat_hazard_hot = make_mat(Color("4c2810"), Color("ffb52e"), 0.38, 0.25, 3.2)
	mat_shard = make_mat(Color("d9fbff"), Color("18e7ff"), 0.15, 0.12, 4.0)
	mat_white = make_mat(Color("eaf8ff"), Color("b6edff"), 0.25, 0.18, 1.4)

func make_mat(albedo: Color, emission: Color = Color.BLACK, metallic := 0.0, roughness := 0.5, energy := 1.0, alpha := 1.0) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(albedo.r, albedo.g, albedo.b, alpha)
	m.metallic = metallic
	m.roughness = roughness
	if emission != Color.BLACK:
		m.emission_enabled = true
		m.emission = emission
		m.emission_energy_multiplier = energy
	if alpha < 1.0:
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	return m

func build_world() -> void:
	var world_env := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	var proc := ProceduralSkyMaterial.new()
	proc.sky_top_color = Color("08051b")
	proc.sky_horizon_color = Color("6b245f")
	proc.ground_bottom_color = Color("030511")
	proc.ground_horizon_color = Color("351334")
	proc.sun_angle_max = 18.0
	sky.sky_material = proc
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.72
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	world_env.environment = env
	add_child(world_env)

	var key := DirectionalLight3D.new()
	key.rotation_degrees = Vector3(-52.0, -25.0, 0.0)
	key.light_color = Color("ffd0eb")
	key.light_energy = 1.35
	key.shadow_enabled = true
	add_child(key)

	var fill := DirectionalLight3D.new()
	fill.rotation_degrees = Vector3(42.0, 155.0, 0.0)
	fill.light_color = Color("42bfff")
	fill.light_energy = 0.55
	add_child(fill)

	moon = MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = 7.5
	sm.height = 15.0
	moon.mesh = sm
	moon.material_override = make_mat(Color("ffb4e5"), Color("ff65ce"), 0.0, 0.9, 1.5)
	moon.position = Vector3(19.0, 18.0, -86.0)
	add_child(moon)

	camera = Camera3D.new()
	camera.position = Vector3(0.0, 4.9, 10.2)
	camera.fov = 68.0
	camera.current = true
	add_child(camera)
	camera.look_at(Vector3(0.0, 0.4, -10.0), Vector3.UP)

func build_track() -> void:
	for i in SEGMENT_COUNT:
		var seg := Node3D.new()
		seg.name = "Segment_%02d" % i
		seg.position.z = -float(i) * SEGMENT_LENGTH + 6.0
		add_child(seg)
		segments.append(seg)
		rebuild_segment(seg, i < 3)

func rebuild_segment(seg: Node3D, safe := false) -> void:
	for child in seg.get_children():
		if child.is_in_group("hazard"):
			child.remove_from_group("hazard")
		if child.is_in_group("shard"):
			child.remove_from_group("shard")
		child.queue_free()

	# Three independent magnetic rails, each with emissive side rails and dash marks.
	for lane_i in 3:
		var x: float = LANE_X[lane_i]
		create_box(seg, Vector3(1.72, 0.18, SEGMENT_LENGTH - 0.12), Vector3(x, -0.28, 0.0), mat_track)
		create_box(seg, Vector3(0.055, 0.065, SEGMENT_LENGTH - 0.18), Vector3(x - 0.89, -0.15, 0.0), mat_track_edge)
		create_box(seg, Vector3(0.055, 0.065, SEGMENT_LENGTH - 0.18), Vector3(x + 0.89, -0.15, 0.0), mat_track_edge)
		for dash_z in [-4.0, 0.0, 4.0]:
			create_box(seg, Vector3(0.09, 0.025, 1.5), Vector3(x, -0.14, dash_z), mat_track_edge)

	# Floating city canyons. Different silhouettes are regenerated every recycle.
	for side in [-1.0, 1.0]:
		for b in 3:
			var h := rng.randf_range(4.0, 13.5)
			var w := rng.randf_range(1.8, 4.1)
			var d := rng.randf_range(2.5, 5.5)
			var bx := side * rng.randf_range(6.2 + b * 1.2, 8.8 + b * 2.2)
			var bz := rng.randf_range(-4.8, 4.8)
			var by := -7.0 + h * 0.5
			var building_mat := mat_city_a if rng.randf() > 0.45 else mat_city_b
			create_box(seg, Vector3(w, h, d), Vector3(bx, by, bz), building_mat)
			create_box(seg, Vector3(w * 0.72, 0.06, d * 0.72), Vector3(bx, by + h * 0.51, bz), mat_window)
			# Vertical luminous signage breaks up silhouettes without textures.
			if rng.randf() < 0.62:
				create_box(seg, Vector3(0.07, min(3.8, h * 0.5), 0.12), Vector3(bx - side * (w * 0.51), by + 0.5, bz), mat_window)

	# Architectural gates make the horizon feel authored rather than empty.
	if rng.randf() < 0.28:
		var gx := 6.05
		create_box(seg, Vector3(0.16, 4.6, 0.18), Vector3(-gx, 1.3, -2.3), mat_track_edge)
		create_box(seg, Vector3(0.16, 4.6, 0.18), Vector3(gx, 1.3, -2.3), mat_track_edge)
		create_box(seg, Vector3(12.2, 0.16, 0.18), Vector3(0.0, 3.55, -2.3), mat_track_edge)

	if safe or state == STATE_MENU:
		spawn_shard_line(seg, rng.randi_range(0, 2), false)
		return

	var difficulty := clamp(distance / 1200.0, 0.0, 1.0)
	var roll := rng.randf()
	var safe_lane := rng.randi_range(0, 2)
	if roll < 0.24:
		spawn_shard_line(seg, safe_lane, rng.randf() < 0.3)
	elif roll < 0.56:
		var blocked := (safe_lane + rng.randi_range(1, 2)) % 3
		spawn_barrier(seg, blocked, false)
		spawn_shard_line(seg, safe_lane, false)
	elif roll < 0.78:
		var beam_lane := (safe_lane + rng.randi_range(1, 2)) % 3
		spawn_beam(seg, beam_lane)
		spawn_shard_line(seg, beam_lane if rng.randf() < 0.42 else safe_lane, true)
	else:
		# Two-lane splitter always leaves a clearly readable safe channel.
		for lane_i in 3:
			if lane_i != safe_lane:
				spawn_barrier(seg, lane_i, difficulty > 0.55 and rng.randf() < 0.35)
		spawn_shard_line(seg, safe_lane, false)

func spawn_barrier(seg: Node3D, lane_i: int, tall := false) -> void:
	var h := 1.65 if tall else 1.05
	var hz := create_box(seg, Vector3(1.34, h, 0.62), Vector3(LANE_X[lane_i], h * 0.5 - 0.08, 0.0), mat_hazard)
	hz.add_to_group("hazard")
	hz.set_meta("kind", "barrier")
	hz.set_meta("resolved", false)
	create_box(hz, Vector3(0.95, 0.08, 0.68), Vector3(0.0, h * 0.18, 0.0), mat_hazard_hot)

func spawn_beam(seg: Node3D, lane_i: int) -> void:
	var hz := create_box(seg, Vector3(1.72, 0.22, 0.58), Vector3(LANE_X[lane_i], 0.86, 0.0), mat_hazard_hot)
	hz.add_to_group("hazard")
	hz.set_meta("kind", "beam")
	hz.set_meta("resolved", false)
	create_box(seg, Vector3(0.10, 0.92, 0.10), Vector3(LANE_X[lane_i] - 0.77, 0.38, 0.0), mat_hazard)
	create_box(seg, Vector3(0.10, 0.92, 0.10), Vector3(LANE_X[lane_i] + 0.77, 0.38, 0.0), mat_hazard)

func spawn_shard_line(seg: Node3D, lane_i: int, airborne := false) -> void:
	for i in 3:
		var y := 1.18 if airborne and i == 1 else 0.42
		var s := create_shard(seg, Vector3(LANE_X[lane_i], y, -3.4 + i * 3.35))
		s.add_to_group("shard")

func create_shard(parent: Node, pos: Vector3) -> MeshInstance3D:
	var n := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = 0.22
	mesh.height = 0.44
	n.mesh = mesh
	n.material_override = mat_shard
	n.position = pos
	n.scale = Vector3(0.72, 1.25, 0.72)
	parent.add_child(n)
	return n

func create_box(parent: Node, size: Vector3, pos: Vector3, material: Material) -> MeshInstance3D:
	var n := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	n.mesh = mesh
	n.position = pos
	n.material_override = material
	parent.add_child(n)
	return n

func build_player() -> void:
	player = Node3D.new()
	player.name = "FluxCraft"
	player.position = Vector3(0.0, 0.44, PLAYER_Z)
	add_child(player)

	var body_mat := make_mat(themes[theme_index].body, Color("09101b"), 0.92, 0.16)
	var accent_mat := make_mat(themes[theme_index].accent, themes[theme_index].accent, 0.55, 0.12, 3.8)
	var accent2_mat := make_mat(themes[theme_index].accent2, themes[theme_index].accent2, 0.45, 0.15, 3.1)

	var body := create_box(player, Vector3(1.12, 0.24, 1.48), Vector3(0.0, 0.02, 0.0), body_mat)
	craft_body_parts.append(body)
	var nose := create_box(player, Vector3(0.68, 0.18, 0.62), Vector3(0.0, 0.13, -0.78), body_mat)
	nose.rotation_degrees.x = -9.0
	craft_body_parts.append(nose)
	var wing_l := create_box(player, Vector3(0.68, 0.08, 0.72), Vector3(-0.78, -0.02, 0.10), body_mat)
	wing_l.rotation_degrees.z = 7.0
	craft_body_parts.append(wing_l)
	var wing_r := create_box(player, Vector3(0.68, 0.08, 0.72), Vector3(0.78, -0.02, 0.10), body_mat)
	wing_r.rotation_degrees.z = -7.0
	craft_body_parts.append(wing_r)

	var core := MeshInstance3D.new()
	var core_mesh := SphereMesh.new()
	core_mesh.radius = 0.29
	core_mesh.height = 0.58
	core.mesh = core_mesh
	core.position = Vector3(0.0, 0.24, -0.05)
	core.material_override = accent_mat
	player.add_child(core)
	craft_accent_parts.append(core)

	for x in [-0.48, 0.48]:
		var engine := create_box(player, Vector3(0.18, 0.14, 0.44), Vector3(x, 0.0, 0.68), accent2_mat)
		craft_accent_parts.append(engine)
		var trail_mat := make_mat(themes[theme_index].accent2, themes[theme_index].accent2, 0.0, 1.0, 2.5, 0.28)
		var trail := create_box(player, Vector3(0.10, 0.06, 2.9), Vector3(x, -0.01, 2.15), trail_mat)
		craft_accent_parts.append(trail)

	# Expanding phase shell: a translucent sphere produces a readable defensive pulse.
	phase_shell = MeshInstance3D.new()
	var ps := SphereMesh.new()
	ps.radius = 0.65
	ps.height = 1.3
	phase_shell.mesh = ps
	phase_shell.material_override = make_mat(themes[theme_index].accent, themes[theme_index].accent, 0.0, 1.0, 2.0, 0.11)
	phase_shell.visible = false
	player.add_child(phase_shell)

func update_player_visual(delta: float) -> void:
	if not player:
		return
	var y := 0.44
	if state == STATE_PLAYING and jump_time > 0.0:
		var p := 1.0 - jump_time / jump_duration
		y += sin(p * PI) * 1.85
	else:
		y += sin(Time.get_ticks_msec() * 0.004) * 0.035
	player.position.y = lerp(player.position.y, y, min(1.0, delta * 18.0))
	var x_error := target_x - player.position.x
	player.rotation.z = lerp(player.rotation.z, -x_error * 0.085, min(1.0, delta * 11.0))
	player.rotation.x = lerp(player.rotation.x, -0.035 + (0.07 if jump_time > 0.0 else 0.0), min(1.0, delta * 8.0))

	if phase_time > 0.0:
		phase_shell.visible = true
		var pp := 1.0 - phase_time / 0.52
		phase_shell.scale = Vector3.ONE * lerp(0.35, 5.4, pp)
	else:
		phase_shell.visible = false

	for shard in get_tree().get_nodes_in_group("shard"):
		if is_instance_valid(shard):
			shard.rotation.y += delta * 3.7
			shard.rotation.z += delta * 1.6

func update_camera(delta: float) -> void:
	if not camera or not player:
		return
	var desired_x := player.position.x * 0.24
	var desired_y := 4.9 + (0.22 if jump_time > 0.0 else 0.0)
	var sx := rng.randf_range(-shake, shake)
	var sy := rng.randf_range(-shake, shake)
	shake = max(0.0, shake - delta * 1.8)
	camera.position.x = lerp(camera.position.x, desired_x + sx, min(1.0, delta * 6.0))
	camera.position.y = lerp(camera.position.y, desired_y + sy, min(1.0, delta * 5.0))
	camera.position.z = 10.2
	camera.rotation.z = lerp(camera.rotation.z, player.rotation.z * 0.16, min(1.0, delta * 5.0))
	camera.fov = lerp(camera.fov, 68.0 + (speed - 18.0) * 0.42, min(1.0, delta * 2.5))
	camera.look_at(Vector3(player.position.x * 0.12, 0.35, -11.0), Vector3.UP)

func check_interactions() -> void:
	for shard in get_tree().get_nodes_in_group("shard"):
		if not is_instance_valid(shard) or not shard.visible:
			continue
		var dz: float = shard.global_position.z - PLAYER_Z
		if abs(dz) < 0.75 and abs(shard.global_position.x - player.position.x) < 0.78 and abs(shard.global_position.y - player.position.y) < 1.05:
			collect_shard(shard)

	for hz in get_tree().get_nodes_in_group("hazard"):
		if not is_instance_valid(hz) or not hz.visible:
			continue
		var dz: float = hz.global_position.z - PLAYER_Z
		var dx: float = abs(hz.global_position.x - player.position.x)
		if abs(dz) < 0.72 and dx < 0.82 and not bool(hz.get_meta("resolved", false)):
			var kind := str(hz.get_meta("kind", "barrier"))
			var jumped_clear := kind == "beam" and player.position.y > 0.98
			if phase_time > 0.0:
				break_hazard(hz)
			elif jumped_clear:
				hz.set_meta("resolved", true)
				award_near_miss()
			elif invincible <= 0.0:
				hz.set_meta("resolved", true)
				take_hit()
		elif dz > 0.9 and dz < 1.7 and not bool(hz.get_meta("resolved", false)):
			hz.set_meta("resolved", true)
			if dx < 3.15:
				award_near_miss()

func collect_shard(shard: Node3D) -> void:
	shard.visible = false
	shard.remove_from_group("shard")
	run_shards += 1
	charge = min(100.0, charge + 13.0)
	combo = min(8, combo + 1)
	combo_timer = 2.45
	play_sfx(sfx_shard, 0.98 + combo * 0.035)
	var tw := create_tween()
	tw.tween_property(shard, "scale", Vector3.ONE * 2.4, 0.08)

func award_near_miss() -> void:
	near_misses += 1
	combo = min(8, combo + 1)
	combo_timer = 2.8
	charge = min(100.0, charge + 11.0)
	play_sfx(sfx_lane, 1.12)
	combo_label.modulate = themes[theme_index].accent2
	var tw := create_tween()
	tw.tween_property(combo_label, "scale", Vector2(1.22, 1.22), 0.08)
	tw.tween_property(combo_label, "scale", Vector2.ONE, 0.17)

func break_hazard(hz: Node3D) -> void:
	hz.set_meta("resolved", true)
	hz.remove_from_group("hazard")
	charge = min(100.0, charge + 6.0)
	combo = min(8, combo + 1)
	combo_timer = 2.8
	var tw := create_tween()
	tw.set_parallel(true)
	tw.tween_property(hz, "scale", Vector3(2.0, 0.05, 2.0), 0.18)
	tw.tween_property(hz, "rotation:y", hz.rotation.y + 1.2, 0.18)
	tw.chain().tween_callback(hz.queue_free)

func take_hit() -> void:
	shields -= 1
	invincible = 1.25
	combo = 1
	charge = max(0.0, charge - 28.0)
	shake = 0.16
	play_sfx(sfx_hit)
	flash(Color(1.0, 0.08, 0.22, 0.42))
	if shields <= 0:
		game_over()

func shift_lane(dir: int) -> void:
	var old := lane
	lane = clampi(lane + dir, 0, 2)
	if lane != old:
		target_x = LANE_X[lane]
		play_sfx(sfx_lane, 0.92 + lane * 0.05)

func jump() -> void:
	if jump_time <= 0.0:
		jump_time = jump_duration
		play_sfx(sfx_jump)

func activate_phase() -> void:
	if charge < 35.0 or phase_time > 0.0:
		return
	charge -= 35.0
	phase_time = 0.52
	invincible = max(invincible, 0.52)
	shake = 0.045
	play_sfx(sfx_phase)
	flash(Color(themes[theme_index].accent, 0.12))

func start_game() -> void:
	state = STATE_PLAYING
	lane = 1
	target_x = 0.0
	player.position = Vector3(0.0, 0.44, PLAYER_Z)
	speed = 18.0
	distance = 0.0
	score = 0
	run_shards = 0
	combo = 1
	combo_timer = 0.0
	charge = 58.0
	shields = 2
	invincible = 0.0
	phase_time = 0.0
	jump_time = 0.0
	near_misses = 0
	mission_done = false
	for i in segments.size():
		segments[i].position.z = -float(i) * SEGMENT_LENGTH + 6.0
		rebuild_segment(segments[i], i < 3)
	menu_panel.visible = false
	over_panel.visible = false
	hud_panel.visible = true
	tutorial_label.visible = true
	mission_label.text = "MISSION  •  5 NEAR MISSES  0/5"
	update_hud()

func game_over() -> void:
	state = STATE_OVER
	total_shards += run_shards
	best_score = max(best_score, score)
	unlocked_themes = 1
	if total_shards >= 80:
		unlocked_themes = 2
	if total_shards >= 220:
		unlocked_themes = 3
	if total_shards >= 480:
		unlocked_themes = 4
	save_game()
	hud_panel.visible = false
	over_panel.visible = true
	final_score_label.text = "%06d" % score
	final_detail_label.text = "BEST  %06d\nSHARDS  +%d   •   NEAR MISS  %d\n%s" % [best_score, run_shards, near_misses, rank_for(best_score)]
	play_sfx(sfx_hit, 0.72)

func show_menu() -> void:
	state = STATE_MENU
	menu_panel.visible = true if menu_panel else false
	hud_panel.visible = false if hud_panel else false
	over_panel.visible = false if over_panel else false
	if menu_panel:
		refresh_menu()

func refresh_menu() -> void:
	best_label.text = "BEST\n%06d" % best_score
	bank_label.text = "SHARDS\n%d" % total_shards
	rank_label.text = "RANK\n%s" % rank_for(best_score)
	theme_button.text = "SKIN  •  %s" % themes[theme_index].name

func rank_for(value: int) -> String:
	if value >= 22000: return "RIFT LEGEND"
	if value >= 12000: return "VOID ACE"
	if value >= 6500: return "NIGHT PILOT"
	if value >= 2500: return "LINE RIDER"
	return "ROOKIE"

func cycle_theme() -> void:
	theme_index = (theme_index + 1) % max(1, unlocked_themes)
	apply_theme(theme_index)
	save_game()
	refresh_menu()
	play_sfx(sfx_shard, 0.82 + theme_index * 0.1)

func apply_theme(idx: int) -> void:
	idx = clampi(idx, 0, themes.size() - 1)
	var t = themes[idx]
	for p in craft_accent_parts:
		if is_instance_valid(p) and p.material_override is StandardMaterial3D:
			var m := p.material_override as StandardMaterial3D
			m.albedo_color = t.accent
			m.emission = t.accent
	for p in craft_body_parts:
		if is_instance_valid(p) and p.material_override is StandardMaterial3D:
			(p.material_override as StandardMaterial3D).albedo_color = t.body
	if phase_shell and phase_shell.material_override is StandardMaterial3D:
		(phase_shell.material_override as StandardMaterial3D).emission = t.accent

func build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	ui_root = Control.new()
	ui_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layer.add_child(ui_root)

	flash_rect = ColorRect.new()
	flash_rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	flash_rect.color = Color.TRANSPARENT
	flash_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui_root.add_child(flash_rect)

	menu_panel = Control.new()
	menu_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui_root.add_child(menu_panel)
	var menu_shade := ColorRect.new()
	menu_shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	menu_shade.color = Color(0.015, 0.01, 0.055, 0.31)
	menu_shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	menu_panel.add_child(menu_shade)

	var title := label("FLUXLINE", 64, Color("f4fbff"), HORIZONTAL_ALIGNMENT_CENTER)
	title.position = Vector2(30, 185)
	title.size = Vector2(660, 88)
	menu_panel.add_child(title)
	var subtitle := label("RIFT COURIER", 18, Color("18e7ff"), HORIZONTAL_ALIGNMENT_CENTER)
	subtitle.position = Vector2(30, 267)
	subtitle.size = Vector2(660, 34)
	menu_panel.add_child(subtitle)

	var line := ColorRect.new()
	line.color = Color("ff3ac8")
	line.position = Vector2(250, 313)
	line.size = Vector2(220, 3)
	menu_panel.add_child(line)

	var card_bg := panel_box(Color(0.03, 0.035, 0.10, 0.78), Color(0.12, 0.32, 0.46, 0.7), 16)
	card_bg.position = Vector2(55, 365)
	card_bg.size = Vector2(610, 150)
	menu_panel.add_child(card_bg)
	best_label = label("", 24, Color.WHITE, HORIZONTAL_ALIGNMENT_CENTER)
	best_label.position = Vector2(10, 24)
	best_label.size = Vector2(190, 100)
	card_bg.add_child(best_label)
	bank_label = label("", 24, Color.WHITE, HORIZONTAL_ALIGNMENT_CENTER)
	bank_label.position = Vector2(210, 24)
	bank_label.size = Vector2(190, 100)
	card_bg.add_child(bank_label)
	rank_label = label("", 19, Color.WHITE, HORIZONTAL_ALIGNMENT_CENTER)
	rank_label.position = Vector2(405, 24)
	rank_label.size = Vector2(195, 100)
	card_bg.add_child(rank_label)

	var start_btn := neon_button("RIDE THE LINE", Vector2(85, 575), Vector2(550, 86), Color("18e7ff"))
	start_btn.pressed.connect(start_game)
	menu_panel.add_child(start_btn)
	theme_button = neon_button("SKIN", Vector2(135, 682), Vector2(450, 62), Color("ff3ac8"))
	theme_button.pressed.connect(cycle_theme)
	menu_panel.add_child(theme_button)

	var controls := label("SWIPE  ←  →   LANE\nSWIPE  ↑   JUMP     •     TAP   PHASE", 17, Color(0.75,0.82,0.95,0.85), HORIZONTAL_ALIGNMENT_CENTER)
	controls.position = Vector2(55, 790)
	controls.size = Vector2(610, 74)
	menu_panel.add_child(controls)
	var promise := label("NO ADS  •  OFFLINE  •  ONE THUMB", 14, Color(0.55,0.67,0.78,0.75), HORIZONTAL_ALIGNMENT_CENTER)
	promise.position = Vector2(55, 1120)
	promise.size = Vector2(610, 30)
	menu_panel.add_child(promise)

	# HUD
	hud_panel = Control.new()
	hud_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui_root.add_child(hud_panel)
	score_label = label("000000", 35, Color.WHITE, HORIZONTAL_ALIGNMENT_LEFT)
	score_label.position = Vector2(28, 32)
	score_label.size = Vector2(250, 50)
	hud_panel.add_child(score_label)
	combo_label = label("x1", 27, Color("18e7ff"), HORIZONTAL_ALIGNMENT_CENTER)
	combo_label.position = Vector2(285, 34)
	combo_label.size = Vector2(150, 45)
	hud_panel.add_child(combo_label)
	shield_label = label("◆ ◆", 24, Color("ff4e78"), HORIZONTAL_ALIGNMENT_RIGHT)
	shield_label.position = Vector2(500, 38)
	shield_label.size = Vector2(190, 40)
	hud_panel.add_child(shield_label)
	shard_label = label("◇ 0", 18, Color("b9f9ff"), HORIZONTAL_ALIGNMENT_LEFT)
	shard_label.position = Vector2(30, 90)
	shard_label.size = Vector2(170, 32)
	hud_panel.add_child(shard_label)
	speed_label = label("018 km/s", 15, Color(0.72,0.78,0.9,0.8), HORIZONTAL_ALIGNMENT_RIGHT)
	speed_label.position = Vector2(510, 92)
	speed_label.size = Vector2(180, 30)
	hud_panel.add_child(speed_label)
	mission_label = label("MISSION  •  5 NEAR MISSES  0/5", 14, Color(0.78,0.84,0.95,0.9), HORIZONTAL_ALIGNMENT_CENTER)
	mission_label.position = Vector2(90, 136)
	mission_label.size = Vector2(540, 30)
	hud_panel.add_child(mission_label)

	charge_bar = ProgressBar.new()
	charge_bar.position = Vector2(75, 1175)
	charge_bar.size = Vector2(570, 12)
	charge_bar.min_value = 0
	charge_bar.max_value = 100
	charge_bar.show_percentage = false
	var bg := StyleBoxFlat.new()
	bg.bg_color = Color(0.02,0.04,0.09,0.82)
	bg.corner_radius_top_left = 7; bg.corner_radius_top_right = 7; bg.corner_radius_bottom_left = 7; bg.corner_radius_bottom_right = 7
	charge_bar.add_theme_stylebox_override("background", bg)
	var fill := StyleBoxFlat.new()
	fill.bg_color = Color("18e7ff")
	fill.corner_radius_top_left = 7; fill.corner_radius_top_right = 7; fill.corner_radius_bottom_left = 7; fill.corner_radius_bottom_right = 7
	charge_bar.add_theme_stylebox_override("fill", fill)
	hud_panel.add_child(charge_bar)
	var phase_text := label("FLUX CHARGE  •  TAP TO PHASE", 13, Color(0.72,0.9,1.0,0.92), HORIZONTAL_ALIGNMENT_CENTER)
	phase_text.position = Vector2(100, 1194)
	phase_text.size = Vector2(520, 26)
	hud_panel.add_child(phase_text)
	tutorial_label = label("SWIPE TO MOVE   •   ↑ JUMP   •   TAP PHASE", 16, Color.WHITE, HORIZONTAL_ALIGNMENT_CENTER)
	tutorial_label.position = Vector2(55, 1065)
	tutorial_label.size = Vector2(610, 40)
	hud_panel.add_child(tutorial_label)

	# Game-over panel.
	over_panel = Control.new()
	over_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui_root.add_child(over_panel)
	var over_shade := ColorRect.new()
	over_shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	over_shade.color = Color(0.01,0.005,0.04,0.74)
	over_panel.add_child(over_shade)
	var over_card := panel_box(Color(0.025,0.025,0.085,0.94), Color("5b2c7c"), 22)
	over_card.position = Vector2(65, 325)
	over_card.size = Vector2(590, 610)
	over_panel.add_child(over_card)
	var run_end := label("LINE BROKEN", 22, Color("ff4e78"), HORIZONTAL_ALIGNMENT_CENTER)
	run_end.position = Vector2(20, 45); run_end.size = Vector2(550, 38); over_card.add_child(run_end)
	final_score_label = label("000000", 56, Color.WHITE, HORIZONTAL_ALIGNMENT_CENTER)
	final_score_label.position = Vector2(20, 105); final_score_label.size = Vector2(550, 80); over_card.add_child(final_score_label)
	final_detail_label = label("", 19, Color(0.76,0.84,0.96,0.92), HORIZONTAL_ALIGNMENT_CENTER)
	final_detail_label.position = Vector2(35, 205); final_detail_label.size = Vector2(520, 130); over_card.add_child(final_detail_label)
	var retry := neon_button("RUN AGAIN", Vector2(70, 380), Vector2(450, 72), Color("18e7ff"))
	retry.pressed.connect(start_game); over_card.add_child(retry)
	var menu_btn := neon_button("BACK TO GRID", Vector2(120, 475), Vector2(350, 58), Color("ff3ac8"))
	menu_btn.pressed.connect(show_menu); over_card.add_child(menu_btn)

	menu_panel.visible = false
	hud_panel.visible = false
	over_panel.visible = false

func label(text_value: String, font_size: int, color: Color, align: int) -> Label:
	var l := Label.new()
	l.text = text_value
	l.add_theme_font_size_override("font_size", font_size)
	l.add_theme_color_override("font_color", color)
	l.horizontal_alignment = align
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	return l

func panel_box(color: Color, border: Color, radius: int) -> Panel:
	var p := Panel.new()
	var s := StyleBoxFlat.new()
	s.bg_color = color
	s.border_color = border
	s.set_border_width_all(1)
	s.corner_radius_top_left = radius; s.corner_radius_top_right = radius; s.corner_radius_bottom_left = radius; s.corner_radius_bottom_right = radius
	p.add_theme_stylebox_override("panel", s)
	return p

func neon_button(text_value: String, pos: Vector2, size_value: Vector2, accent: Color) -> Button:
	var b := Button.new()
	b.text = text_value
	b.position = pos
	b.size = size_value
	b.add_theme_font_size_override("font_size", 19)
	b.add_theme_color_override("font_color", Color.WHITE)
	b.add_theme_color_override("font_hover_color", Color.WHITE)
	for key in ["normal", "hover", "pressed"]:
		var s := StyleBoxFlat.new()
		s.bg_color = Color(accent.r * 0.13, accent.g * 0.13, accent.b * 0.13, 0.91) if key == "normal" else Color(accent.r * 0.24, accent.g * 0.24, accent.b * 0.24, 0.96)
		s.border_color = Color(accent.r, accent.g, accent.b, 0.9)
		s.set_border_width_all(2 if key == "pressed" else 1)
		s.corner_radius_top_left = 14; s.corner_radius_top_right = 14; s.corner_radius_bottom_left = 14; s.corner_radius_bottom_right = 14
		b.add_theme_stylebox_override(key, s)
	return b

func update_hud() -> void:
	score_label.text = "%06d" % score
	combo_label.text = "x%d" % combo
	shard_label.text = "◇ %d" % run_shards
	shield_label.text = "◆ ◆" if shields >= 2 else ("◆ ◇" if shields == 1 else "◇ ◇")
	speed_label.text = "%03d km/s" % int(speed)
	charge_bar.value = charge
	mission_label.text = "MISSION  •  5 NEAR MISSES  %d/5" % min(5, near_misses) if not mission_done else "MISSION COMPLETE  +500"
	if distance > 150.0:
		tutorial_label.visible = false

func flash(c: Color) -> void:
	flash_rect.color = c
	var tw := create_tween()
	tw.tween_property(flash_rect, "color", Color(c.r, c.g, c.b, 0.0), 0.24)

func build_audio() -> void:
	for i in 5:
		var p := AudioStreamPlayer.new()
		p.volume_db = -7.0
		add_child(p)
		audio_pool.append(p)
	sfx_lane = make_sweep(260.0, 420.0, 0.075, 0.30)
	sfx_jump = make_sweep(220.0, 650.0, 0.14, 0.34)
	sfx_shard = make_sweep(760.0, 1180.0, 0.095, 0.27)
	sfx_phase = make_sweep(125.0, 920.0, 0.28, 0.38)
	sfx_hit = make_sweep(190.0, 72.0, 0.34, 0.46)
	music_player = AudioStreamPlayer.new()
	music_player.stream = make_music_loop()
	music_player.volume_db = -19.0
	add_child(music_player)
	music_player.play()

func play_sfx(stream: AudioStreamWAV, pitch := 1.0) -> void:
	if audio_pool.is_empty(): return
	var p := audio_pool[audio_cursor % audio_pool.size()]
	audio_cursor += 1
	p.stream = stream
	p.pitch_scale = pitch
	p.play()

func make_sweep(f0: float, f1: float, seconds: float, amp: float) -> AudioStreamWAV:
	var rate := 22050
	var count := int(rate * seconds)
	var data := PackedByteArray()
	data.resize(count * 2)
	var phase := 0.0
	for i in count:
		var t := float(i) / max(1.0, float(count - 1))
		var freq := lerp(f0, f1, t)
		phase += TAU * freq / rate
		var env := sin(PI * t)
		var sample := int(clamp(sin(phase) * env * amp, -1.0, 1.0) * 32767.0)
		data.encode_s16(i * 2, sample)
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = rate
	wav.stereo = false
	wav.data = data
	return wav

func make_music_loop() -> AudioStreamWAV:
	var rate := 22050
	var seconds := 4.0
	var count := int(rate * seconds)
	var data := PackedByteArray()
	data.resize(count * 2)
	var notes := [110.0, 138.59, 164.81, 220.0]
	for i in count:
		var t := float(i) / rate
		var step := int(t * 4.0) % notes.size()
		var beat_phase := fmod(t * 4.0, 1.0)
		var pulse := exp(-beat_phase * 5.2)
		var bass := sin(TAU * 55.0 * t) * 0.10
		var arp := sin(TAU * notes[step] * 2.0 * t) * pulse * 0.07
		var pad := (sin(TAU * 110.0 * t) + sin(TAU * 164.81 * t)) * 0.025
		var sample := int(clamp(bass + arp + pad, -0.75, 0.75) * 32767.0)
		data.encode_s16(i * 2, sample)
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = rate
	wav.stereo = false
	wav.data = data
	wav.loop_mode = AudioStreamWAV.LOOP_FORWARD
	wav.loop_begin = 0
	wav.loop_end = count
	return wav

func load_save() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SAVE_PATH) == OK:
		best_score = int(cfg.get_value("progress", "best", 0))
		total_shards = int(cfg.get_value("progress", "shards", 0))
		theme_index = int(cfg.get_value("progress", "theme", 0))
	unlocked_themes = 1 + int(total_shards >= 80) + int(total_shards >= 220) + int(total_shards >= 480)
	theme_index = clampi(theme_index, 0, unlocked_themes - 1)

func save_game() -> void:
	var cfg := ConfigFile.new()
	cfg.set_value("progress", "best", best_score)
	cfg.set_value("progress", "shards", total_shards)
	cfg.set_value("progress", "theme", theme_index)
	cfg.save(SAVE_PATH)
