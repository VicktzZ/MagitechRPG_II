/* eslint-disable camelcase */
import { memo, type CSSProperties, type ReactElement } from 'react'

import acid from './acid.svg'
import acorn from './acorn.svg'
import alien_fire from './alien-fire.svg'
import all_for_one from './all-for-one.svg'
import alligator_clip from './alligator-clip.svg'
import ammo_bag from './ammo-bag.svg'
import anchor from './anchor.svg'
import angel_wings from './angel-wings.svg'
import ankh from './ankh.svg'
import anvil from './anvil.svg'
import apple from './apple.svg'
import aquarius from './aquarius.svg'
import arcane_mask from './arcane-mask.svg'
import archer from './archer.svg'
import archery_target from './archery-target.svg'
import arena from './arena.svg'
import aries from './aries.svg'
import arrow_cluster from './arrow-cluster.svg'
import arrow_flights from './arrow-flights.svg'
import arson from './arson.svg'
import aura from './aura.svg'
import aware from './aware.svg'
import axe_swing from './axe-swing.svg'
import axe from './axe.svg'
import ball from './ball.svg'
import barbed_arrow from './barbed-arrow.svg'
import barrier from './barrier.svg'
import bat_sword from './bat-sword.svg'
import battered_axe from './battered-axe.svg'
import batteries from './batteries.svg'
import battery_0 from './battery-0.svg'
import battery_100 from './battery-100.svg'
import battery_25 from './battery-25.svg'
import battery_50 from './battery-50.svg'
import battery_75 from './battery-75.svg'
import battery_black from './battery-black.svg'
import battery_negative from './battery-negative.svg'
import battery_positive from './battery-positive.svg'
import battery_white from './battery-white.svg'
import batwings from './batwings.svg'
import beam_wake from './beam-wake.svg'
import bear_trap from './bear-trap.svg'
import beer from './beer.svg'
import beetle from './beetle.svg'
import bell from './bell.svg'
import biohazard from './biohazard.svg'
import bird_claw from './bird-claw.svg'
import bird_mask from './bird-mask.svg'
import blade_bite from './blade-bite.svg'
import blast from './blast.svg'
import blaster from './blaster.svg'
import bleeding_eye from './bleeding-eye.svg'
import bleeding_hearts from './bleeding-hearts.svg'
import bolt_shield from './bolt-shield.svg'
import bomb_explosion from './bomb-explosion.svg'
import bombs from './bombs.svg'
import bone_bite from './bone-bite.svg'
import bone_knife from './bone-knife.svg'
import book from './book.svg'
import boomerang from './boomerang.svg'
import boot_stomp from './boot-stomp.svg'
import bottle_vapors from './bottle-vapors.svg'
import bottled_bolt from './bottled-bolt.svg'
import bottom_right from './bottom-right.svg'
import bowie_knife from './bowie-knife.svg'
import bowling_pin from './bowling-pin.svg'
import brain_freeze from './brain-freeze.svg'
import brandy_bottle from './brandy-bottle.svg'
import bridge from './bridge.svg'
import broadhead_arrow from './broadhead-arrow.svg'
import broadsword from './broadsword.svg'
import broken_bone from './broken-bone.svg'
import broken_bottle from './broken-bottle.svg'
import broken_heart from './broken-heart.svg'
import broken_shield from './broken-shield.svg'
import broken_skull from './broken-skull.svg'
import bubbling_potion from './bubbling-potion.svg'
import bullets from './bullets.svg'
import burning_book from './burning-book.svg'
import burning_embers from './burning-embers.svg'
import burning_eye from './burning-eye.svg'
import burning_meteor from './burning-meteor.svg'
import burst_blob from './burst-blob.svg'
import butterfly from './butterfly.svg'
import campfire from './campfire.svg'
import cancel from './cancel.svg'
import cancer from './cancer.svg'
import candle_fire from './candle-fire.svg'
import candle from './candle.svg'
import cannon_shot from './cannon-shot.svg'
import capitol from './capitol.svg'
import capricorn from './capricorn.svg'
import carrot from './carrot.svg'
import castle_emblem from './castle-emblem.svg'
import castle_flag from './castle-flag.svg'
import cat from './cat.svg'
import chain from './chain.svg'
import cheese from './cheese.svg'
import chemical_arrow from './chemical-arrow.svg'
import chessboard from './chessboard.svg'
import chicken_leg from './chicken-leg.svg'
import circle_of_circles from './circle-of-circles.svg'
import circular_saw from './circular-saw.svg'
import circular_shield from './circular-shield.svg'
import cloak_and_dagger from './cloak-and-dagger.svg'
import clockwork from './clockwork.svg'
import clover from './clover.svg'
import clovers_card from './clovers-card.svg'
import clovers from './clovers.svg'
import cluster_bomb from './cluster-bomb.svg'
import coffee_mug from './coffee-mug.svg'
import cog_wheel from './cog-wheel.svg'
import cog from './cog.svg'
import cold_heart from './cold-heart.svg'
import compass from './compass.svg'
import corked_tube from './corked-tube.svg'
import crab_claw from './crab-claw.svg'
import cracked_helm from './cracked-helm.svg'
import cracked_shield from './cracked-shield.svg'
import croc_sword from './croc-sword.svg'
import crossbow from './crossbow.svg'
import crossed_axes from './crossed-axes.svg'
import crossed_bones from './crossed-bones.svg'
import crossed_pistols from './crossed-pistols.svg'
import crossed_sabres from './crossed-sabres.svg'
import crossed_swords from './crossed-swords.svg'
import crown_of_thorns from './crown-of-thorns.svg'
import crown from './crown.svg'
import crowned_heart from './crowned-heart.svg'
import crush from './crush.svg'
import crystal_ball from './crystal-ball.svg'
import crystal_cluster from './crystal-cluster.svg'
import crystal_wand from './crystal-wand.svg'
import crystals from './crystals.svg'
import cubes from './cubes.svg'
import cut_palm from './cut-palm.svg'
import cycle from './cycle.svg'
import daggers from './daggers.svg'
import daisy from './daisy.svg'
import dead_tree from './dead-tree.svg'
import death_skull from './death-skull.svg'
import decapitation from './decapitation.svg'
import defibrillate from './defibrillate.svg'
import demolish from './demolish.svg'
import dervish_swords from './dervish-swords.svg'
import desert_skull from './desert-skull.svg'
import diamond from './diamond.svg'
import diamonds_card from './diamonds-card.svg'
import diamonds from './diamonds.svg'
import dice_five from './dice-five.svg'
import dice_four from './dice-four.svg'
import dice_one from './dice-one.svg'
import dice_six from './dice-six.svg'
import dice_three from './dice-three.svg'
import dice_two from './dice-two.svg'
import dinosaur from './dinosaur.svg'
import divert from './divert.svg'
import diving_dagger from './diving-dagger.svg'
import double_team from './double-team.svg'
import doubled from './doubled.svg'
import dragon_breath from './dragon-breath.svg'
import dragon_wing from './dragon-wing.svg'
import dragon from './dragon.svg'
import dragonfly from './dragonfly.svg'
import drill from './drill.svg'
import dripping_blade from './dripping-blade.svg'
import dripping_knife from './dripping-knife.svg'
import dripping_sword from './dripping-sword.svg'
import droplet_splash from './droplet-splash.svg'
import droplet from './droplet.svg'
import droplets from './droplets.svg'
import duel from './duel.svg'
import egg_pod from './egg-pod.svg'
import egg from './egg.svg'
import eggplant from './eggplant.svg'
import emerald from './emerald.svg'
import energise from './energise.svg'
import explosion from './explosion.svg'
import explosive_materials from './explosive-materials.svg'
import eye_monster from './eye-monster.svg'
import eye_shield from './eye-shield.svg'
import eyeball from './eyeball.svg'
import fairy_wand from './fairy-wand.svg'
import fairy from './fairy.svg'
import fall_down from './fall-down.svg'
import falling from './falling.svg'
import fast_ship from './fast-ship.svg'
import feather_wing from './feather-wing.svg'
import feathered_wing from './feathered-wing.svg'
import fedora from './fedora.svg'
import fire_bomb from './fire-bomb.svg'
import fire_breath from './fire-breath.svg'
import fire_ring from './fire-ring.svg'
import fire_shield from './fire-shield.svg'
import fire_symbol from './fire-symbol.svg'
import fire from './fire.svg'
import fireball_sword from './fireball-sword.svg'
import fish from './fish.svg'
import fizzing_flask from './fizzing-flask.svg'
import flame_symbol from './flame-symbol.svg'
import flaming_arrow from './flaming-arrow.svg'
import flaming_claw from './flaming-claw.svg'
import flaming_trident from './flaming-trident.svg'
import flask from './flask.svg'
import flat_hammer from './flat-hammer.svg'
import flower from './flower.svg'
import flowers from './flowers.svg'
import fluffy_swirl from './fluffy-swirl.svg'
import focused_lightning from './focused-lightning.svg'
import food_chain from './food-chain.svg'
import footprint from './footprint.svg'
import forging from './forging.svg'
import forward from './forward.svg'
import fox from './fox.svg'
import frost_emblem from './frost-emblem.svg'
import frostfire from './frostfire.svg'
import frozen_arrow from './frozen-arrow.svg'
import gamepad_cross from './gamepad-cross.svg'
import gavel from './gavel.svg'
import gear_hammer from './gear-hammer.svg'
import gear_heart from './gear-heart.svg'
import gears from './gears.svg'
import gecko from './gecko.svg'
import gem_pendant from './gem-pendant.svg'
import gem from './gem.svg'
import gemini from './gemini.svg'
import glass_heart from './glass-heart.svg'
import gloop from './gloop.svg'
import gold_bar from './gold-bar.svg'
import grappling_hook from './grappling-hook.svg'
import grass_patch from './grass-patch.svg'
import grass from './grass.svg'
import grenade from './grenade.svg'
import groundbreaker from './groundbreaker.svg'
import guarded_tower from './guarded-tower.svg'
import guillotine from './guillotine.svg'
import halberd from './halberd.svg'
import hammer_drop from './hammer-drop.svg'
import hammer from './hammer.svg'
import hand_emblem from './hand-emblem.svg'
import hand_saw from './hand-saw.svg'
import hand from './hand.svg'
import harpoon_trident from './harpoon-trident.svg'
import health_decrease from './health-decrease.svg'
import health_increase from './health-increase.svg'
import health from './health.svg'
import heart_bottle from './heart-bottle.svg'
import heart_tower from './heart-tower.svg'
import heartburn from './heartburn.svg'
import hearts_card from './hearts-card.svg'
import hearts from './hearts.svg'
import heat_haze from './heat-haze.svg'
import heavy_fall from './heavy-fall.svg'
import heavy_shield from './heavy-shield.svg'
import helmet from './helmet.svg'
import help from './help.svg'
import hive_emblem from './hive-emblem.svg'
import hole_ladder from './hole-ladder.svg'
import honeycomb from './honeycomb.svg'
import hood from './hood.svg'
import horn_call from './horn-call.svg'
import horns from './horns.svg'
import horseshoe from './horseshoe.svg'
import hospital_cross from './hospital-cross.svg'
import hot_surface from './hot-surface.svg'
import hourglass from './hourglass.svg'
import hydra_shot from './hydra-shot.svg'
import hydra from './hydra.svg'
import ice_cube from './ice-cube.svg'
import implosion from './implosion.svg'
import incense from './incense.svg'
import insect_jaws from './insect-jaws.svg'
import interdiction from './interdiction.svg'
import jetpack from './jetpack.svg'
import jigsaw_piece from './jigsaw-piece.svg'
import kaleidoscope from './kaleidoscope.svg'
import kettlebell from './kettlebell.svg'
import key_basic from './key-basic.svg'
import key from './key.svg'
import kitchen_knives from './kitchen-knives.svg'
import knife_fork from './knife-fork.svg'
import knife from './knife.svg'
import knight_helmet from './knight-helmet.svg'
import kunai from './kunai.svg'
import lantern_flame from './lantern-flame.svg'
import large_hammer from './large-hammer.svg'
import laser_blast from './laser-blast.svg'
import laser_site from './laser-site.svg'
import lava from './lava.svg'
import leaf from './leaf.svg'
import leo from './leo.svg'
import level_four_advanced from './level-four-advanced.svg'
import level_four from './level-four.svg'
import level_three_advanced from './level-three-advanced.svg'
import level_three from './level-three.svg'
import level_two_advanced from './level-two-advanced.svg'
import level_two from './level-two.svg'
import lever from './lever.svg'
import libra from './libra.svg'
import light_bulb from './light-bulb.svg'
import lighthouse from './lighthouse.svg'
import lightning_bolt from './lightning-bolt.svg'
import lightning_storm from './lightning-storm.svg'
import lightning_sword from './lightning-sword.svg'
import lightning_trio from './lightning-trio.svg'
import lightning from './lightning.svg'
import lion from './lion.svg'
import lit_candelabra from './lit-candelabra.svg'
import load from './load.svg'
import locked_fortress from './locked-fortress.svg'
import love_howl from './love-howl.svg'
import maggot from './maggot.svg'
import magnet from './magnet.svg'
import mass_driver from './mass-driver.svg'
import match from './match.svg'
import meat_hook from './meat-hook.svg'
import meat from './meat.svg'
import medical_pack from './medical-pack.svg'
import metal_gate from './metal-gate.svg'
import microphone from './microphone.svg'
import mine_wagon from './mine-wagon.svg'
import mining_diamonds from './mining-diamonds.svg'
import mirror from './mirror.svg'
import monster_skull from './monster-skull.svg'
import montains from './montains.svg'
import moon_sun from './moon-sun.svg'
import mp5 from './mp5.svg'
import muscle_fat from './muscle-fat.svg'
import muscle_up from './muscle-up.svg'
import musket from './musket.svg'
import nails from './nails.svg'
import nodular from './nodular.svg'
import noose from './noose.svg'
import nuclear from './nuclear.svg'
import ocarina from './ocarina.svg'
import ocean_emblem from './ocean-emblem.svg'
import octopus from './octopus.svg'
import omega from './omega.svg'
import on_target from './on-target.svg'
import ophiuchus from './ophiuchus.svg'
import overhead from './overhead.svg'
import overmind from './overmind.svg'
import palm_tree from './palm-tree.svg'
import pawn from './pawn.svg'
import pawprint from './pawprint.svg'
import perspective_dice_five from './perspective-dice-five.svg'
import perspective_dice_four from './perspective-dice-four.svg'
import perspective_dice_one from './perspective-dice-one.svg'
import perspective_dice_random from './perspective-dice-random.svg'
import perspective_dice_six_two from './perspective-dice-six-two.svg'
import perspective_dice_six from './perspective-dice-six.svg'
import perspective_dice_three from './perspective-dice-three.svg'
import pill from './pill.svg'
import pills from './pills.svg'
import pine_tree from './pine-tree.svg'
import ping_pong from './ping-pong.svg'
import pisces from './pisces.svg'
import plain_dagger from './plain-dagger.svg'
import player_despair from './player-despair.svg'
import player_dodge from './player-dodge.svg'
import player_king from './player-king.svg'
import player_lift from './player-lift.svg'
import player_pain from './player-pain.svg'
import player_pyromaniac from './player-pyromaniac.svg'
import player_shot from './player-shot.svg'
import player_teleport from './player-teleport.svg'
import player_thunder_struck from './player-thunder-struck.svg'
import player from './player.svg'
import podium from './podium.svg'
import poison_cloud from './poison-cloud.svg'
import potion from './potion.svg'
import pyramids from './pyramids.svg'
import queen_crown from './queen-crown.svg'
import quill_ink from './quill-ink.svg'
import rabbit from './rabbit.svg'
import radar_dish from './radar-dish.svg'
import radial_balance from './radial-balance.svg'
import radioactive from './radioactive.svg'
import raven from './raven.svg'
import reactor from './reactor.svg'
import recycle from './recycle.svg'
import regeneration from './regeneration.svg'
import relic_blade from './relic-blade.svg'
import repair from './repair.svg'
import reverse from './reverse.svg'
import revolver from './revolver.svg'
import rifle from './rifle.svg'
import ringing_bell from './ringing-bell.svg'
import roast_chicken from './roast-chicken.svg'
import robot_arm from './robot-arm.svg'
import round_bottom_flask from './round-bottom-flask.svg'
import round_shield from './round-shield.svg'
import rss from './rss.svg'
import rune_stone from './rune-stone.svg'
import sagittarius from './sagittarius.svg'
import sapphire from './sapphire.svg'
import satellite from './satellite.svg'
import save from './save.svg'
import scorpio from './scorpio.svg'
import scroll_unfurled from './scroll-unfurled.svg'
import scythe from './scythe.svg'
import sea_serpent from './sea-serpent.svg'
import seagull from './seagull.svg'
import shark from './shark.svg'
import sheep from './sheep.svg'
import sheriff from './sheriff.svg'
import shield from './shield.svg'
import ship_emblem from './ship-emblem.svg'
import shoe_prints from './shoe-prints.svg'
import shot_through_the_heart from './shot-through-the-heart.svg'
import shotgun_shell from './shotgun-shell.svg'
import shovel from './shovel.svg'
import shuriken from './shuriken.svg'
import sickle from './sickle.svg'
import sideswipe from './sideswipe.svg'
import site from './site.svg'
import skull_trophy from './skull-trophy.svg'
import skull from './skull.svg'
import slash_ring from './slash-ring.svg'
import small_fire from './small-fire.svg'
import snail from './snail.svg'
import snake from './snake.svg'
import snorkel from './snorkel.svg'
import snowflake from './snowflake.svg'
import soccer_ball from './soccer-ball.svg'
import spades_card from './spades-card.svg'
import spades from './spades.svg'
import spawn_node from './spawn-node.svg'
import spear_head from './spear-head.svg'
import speech_bubble from './speech-bubble.svg'
import speech_bubbles from './speech-bubbles.svg'
import spider_face from './spider-face.svg'
import spikeball from './spikeball.svg'
import spiked_mace from './spiked-mace.svg'
import spiked_tentacle from './spiked-tentacle.svg'
import spinning_sword from './spinning-sword.svg'
import spiral_shell from './spiral-shell.svg'
import splash from './splash.svg'
import spray_can from './spray-can.svg'
import sprout_emblem from './sprout-emblem.svg'
import sprout from './sprout.svg'
import stopwatch from './stopwatch.svg'
import suckered_tentacle from './suckered-tentacle.svg'
import suits from './suits.svg'
import sun_symbol from './sun-symbol.svg'
import sun from './sun.svg'
import sunbeams from './sunbeams.svg'
import super_mushroom from './super-mushroom.svg'
import supersonic_arrow from './supersonic-arrow.svg'
import surveillance_camera from './surveillance-camera.svg'
import syringe from './syringe.svg'
import target_arrows from './target-arrows.svg'
import target_laser from './target-laser.svg'
import targeted from './targeted.svg'
import taurus from './taurus.svg'
import telescope from './telescope.svg'
import tentacle from './tentacle.svg'
import tesla from './tesla.svg'
import thorn_arrow from './thorn-arrow.svg'
import thorny_vine from './thorny-vine.svg'
import three_keys from './three-keys.svg'
import tic_tac_toe from './tic-tac-toe.svg'
import toast from './toast.svg'
import tombstone from './tombstone.svg'
import tooth from './tooth.svg'
import torch from './torch.svg'
import tower from './tower.svg'
import trail from './trail.svg'
import trefoil_lily from './trefoil-lily.svg'
import trident from './trident.svg'
import triforce from './triforce.svg'
import trophy from './trophy.svg'
import turd from './turd.svg'
import two_dragons from './two-dragons.svg'
import two_hearts from './two-hearts.svg'
import uncertainty from './uncertainty.svg'
import underhand from './underhand.svg'
import unplugged from './unplugged.svg'
import vase from './vase.svg'
import venomous_snake from './venomous-snake.svg'
import vest from './vest.svg'
import vial from './vial.svg'
import vine_whip from './vine-whip.svg'
import virgo from './virgo.svg'
import water_drop from './water-drop.svg'
import wifi from './wifi.svg'
import wireless_signal from './wireless-signal.svg'
import wolf_head from './wolf-head.svg'
import wolf_howl from './wolf-howl.svg'
import wooden_sign from './wooden-sign.svg'
import wrench from './wrench.svg'
import wyvern from './wyvern.svg'
import x_mark from './x-mark.svg'
import zebra_shield from './zebra-shield.svg'
import zigzag_leaf from './zigzag-leaf.svg'
import Image from 'next/image'

const icons = {
    acid,
    acorn,
    alien_fire,
    all_for_one,
    alligator_clip,
    ammo_bag,
    anchor,
    angel_wings,
    ankh,
    anvil,
    apple,
    aquarius,
    arcane_mask,
    archer,
    archery_target,
    arena,
    aries,
    arrow_cluster,
    arrow_flights,
    arson,
    aura,
    aware,
    axe_swing,
    axe,
    ball,
    barbed_arrow,
    barrier,
    bat_sword,
    battered_axe,
    batteries,
    battery_0,
    battery_100,
    battery_25,
    battery_50,
    battery_75,
    battery_black,
    battery_negative,
    battery_positive,
    battery_white,
    batwings,
    beam_wake,
    bear_trap,
    beer,
    beetle,
    bell,
    biohazard,
    bird_claw,
    bird_mask,
    blade_bite,
    blast,
    blaster,
    bleeding_eye,
    bleeding_hearts,
    bolt_shield,
    bomb_explosion,
    bombs,
    bone_bite,
    bone_knife,
    book,
    boomerang,
    boot_stomp,
    bottle_vapors,
    bottled_bolt,
    bottom_right,
    bowie_knife,
    bowling_pin,
    brain_freeze,
    brandy_bottle,
    bridge,
    broadhead_arrow,
    broadsword,
    broken_bone,
    broken_bottle,
    broken_heart,
    broken_shield,
    broken_skull,
    bubbling_potion,
    bullets,
    burning_book,
    burning_embers,
    burning_eye,
    burning_meteor,
    burst_blob,
    butterfly,
    campfire,
    cancel,
    cancer,
    candle_fire,
    candle,
    cannon_shot,
    capitol,
    capricorn,
    carrot,
    castle_emblem,
    castle_flag,
    cat,
    chain,
    cheese,
    chemical_arrow,
    chessboard,
    chicken_leg,
    circle_of_circles,
    circular_saw,
    circular_shield,
    cloak_and_dagger,
    clockwork,
    clover,
    clovers_card,
    clovers,
    cluster_bomb,
    coffee_mug,
    cog_wheel,
    cog,
    cold_heart,
    compass,
    corked_tube,
    crab_claw,
    cracked_helm,
    cracked_shield,
    croc_sword,
    crossbow,
    crossed_axes,
    crossed_bones,
    crossed_pistols,
    crossed_sabres,
    crossed_swords,
    crown_of_thorns,
    crown,
    crowned_heart,
    crush,
    crystal_ball,
    crystal_cluster,
    crystal_wand,
    crystals,
    cubes,
    cut_palm,
    cycle,
    daggers,
    daisy,
    dead_tree,
    death_skull,
    decapitation,
    defibrillate,
    demolish,
    dervish_swords,
    desert_skull,
    diamond,
    diamonds_card,
    diamonds,
    dice_five,
    dice_four,
    dice_one,
    dice_six,
    dice_three,
    dice_two,
    dinosaur,
    divert,
    diving_dagger,
    double_team,
    doubled,
    dragon_breath,
    dragon_wing,
    dragon,
    dragonfly,
    drill,
    dripping_blade,
    dripping_knife,
    dripping_sword,
    droplet_splash,
    droplet,
    droplets,
    duel,
    egg_pod,
    egg,
    eggplant,
    emerald,
    energise,
    explosion,
    explosive_materials,
    eye_monster,
    eye_shield,
    eyeball,
    fairy_wand,
    fairy,
    fall_down,
    falling,
    fast_ship,
    feather_wing,
    feathered_wing,
    fedora,
    fire_bomb,
    fire_breath,
    fire_ring,
    fire_shield,
    fire_symbol,
    fire,
    fireball_sword,
    fish,
    fizzing_flask,
    flame_symbol,
    flaming_arrow,
    flaming_claw,
    flaming_trident,
    flask,
    flat_hammer,
    flower,
    flowers,
    fluffy_swirl,
    focused_lightning,
    food_chain,
    footprint,
    forging,
    forward,
    fox,
    frost_emblem,
    frostfire,
    frozen_arrow,
    gamepad_cross,
    gavel,
    gear_hammer,
    gear_heart,
    gears,
    gecko,
    gem_pendant,
    gem,
    gemini,
    glass_heart,
    gloop,
    gold_bar,
    grappling_hook,
    grass_patch,
    grass,
    grenade,
    groundbreaker,
    guarded_tower,
    guillotine,
    halberd,
    hammer_drop,
    hammer,
    hand_emblem,
    hand_saw,
    hand,
    harpoon_trident,
    health_decrease,
    health_increase,
    health,
    heart_bottle,
    heart_tower,
    heartburn,
    hearts_card,
    hearts,
    heat_haze,
    heavy_fall,
    heavy_shield,
    helmet,
    help,
    hive_emblem,
    hole_ladder,
    honeycomb,
    hood,
    horn_call,
    horns,
    horseshoe,
    hospital_cross,
    hot_surface,
    hourglass,
    hydra_shot,
    hydra,
    ice_cube,
    implosion,
    incense,
    insect_jaws,
    interdiction,
    jetpack,
    jigsaw_piece,
    kaleidoscope,
    kettlebell,
    key_basic,
    key,
    kitchen_knives,
    knife_fork,
    knife,
    knight_helmet,
    kunai,
    lantern_flame,
    large_hammer,
    laser_blast,
    laser_site,
    lava,
    leaf,
    leo,
    level_four_advanced,
    level_four,
    level_three_advanced,
    level_three,
    level_two_advanced,
    level_two,
    lever,
    libra,
    light_bulb,
    lighthouse,
    lightning_bolt,
    lightning_storm,
    lightning_sword,
    lightning_trio,
    lightning,
    lion,
    lit_candelabra,
    load,
    locked_fortress,
    love_howl,
    maggot,
    magnet,
    mass_driver,
    match,
    meat_hook,
    meat,
    medical_pack,
    metal_gate,
    microphone,
    mine_wagon,
    mining_diamonds,
    mirror,
    monster_skull,
    montains,
    moon_sun,
    mp5,
    muscle_fat,
    muscle_up,
    musket,
    nails,
    nodular,
    noose,
    nuclear,
    ocarina,
    ocean_emblem,
    octopus,
    omega,
    on_target,
    ophiuchus,
    overhead,
    overmind,
    palm_tree,
    pawn,
    pawprint,
    perspective_dice_five,
    perspective_dice_four,
    perspective_dice_one,
    perspective_dice_random,
    perspective_dice_six_two,
    perspective_dice_six,
    perspective_dice_three,
    pill,
    pills,
    pine_tree,
    ping_pong,
    pisces,
    plain_dagger,
    player_despair,
    player_dodge,
    player_king,
    player_lift,
    player_pain,
    player_pyromaniac,
    player_shot,
    player_teleport,
    player_thunder_struck,
    player,
    podium,
    poison_cloud,
    potion,
    pyramids,
    queen_crown,
    quill_ink,
    rabbit,
    radar_dish,
    radial_balance,
    radioactive,
    raven,
    reactor,
    recycle,
    regeneration,
    relic_blade,
    repair,
    reverse,
    revolver,
    rifle,
    ringing_bell,
    roast_chicken,
    robot_arm,
    round_bottom_flask,
    round_shield,
    rss,
    rune_stone,
    sagittarius,
    sapphire,
    satellite,
    save,
    scorpio,
    scroll_unfurled,
    scythe,
    sea_serpent,
    seagull,
    shark,
    sheep,
    sheriff,
    shield,
    ship_emblem,
    shoe_prints,
    shot_through_the_heart,
    shotgun_shell,
    shovel,
    shuriken,
    sickle,
    sideswipe,
    site,
    skull_trophy,
    skull,
    slash_ring,
    small_fire,
    snail,
    snake,
    snorkel,
    snowflake,
    soccer_ball,
    spades_card,
    spades,
    spawn_node,
    spear_head,
    speech_bubble,
    speech_bubbles,
    spider_face,
    spikeball,
    spiked_mace,
    spiked_tentacle,
    spinning_sword,
    spiral_shell,
    splash,
    spray_can,
    sprout_emblem,
    sprout,
    stopwatch,
    suckered_tentacle,
    suits,
    sun_symbol,
    sun,
    sunbeams,
    super_mushroom,
    supersonic_arrow,
    surveillance_camera,
    syringe,
    target_arrows,
    target_laser,
    targeted,
    taurus,
    telescope,
    tentacle,
    tesla,
    thorn_arrow,
    thorny_vine,
    three_keys,
    tic_tac_toe,
    toast,
    tombstone,
    tooth,
    torch,
    tower,
    trail,
    trefoil_lily,
    trident,
    triforce,
    trophy,
    turd,
    two_dragons,
    two_hearts,
    uncertainty,
    underhand,
    unplugged,
    vase,
    venomous_snake,
    vest,
    vial,
    vine_whip,
    virgo,
    water_drop,
    wifi,
    wireless_signal,
    wolf_head,
    wolf_howl,
    wooden_sign,
    wrench,
    wyvern,
    x_mark,
    zebra_shield,
    zigzag_leaf
}

export type IconType = keyof typeof icons

const RPGIcon = memo(({ 
    icon,
    height = '1.5rem',
    width = '1.5rem',
    sx
}: { 
    icon: IconType
    height?: CSSProperties['height'] 
    width?: CSSProperties['width'] 
    sx?: CSSProperties
}): ReactElement => {
    return (
        <Image
            style={{
                height,
                width,
                filter: 'invert(100%) sepia(71%) saturate(0%) hue-rotate(206deg) brightness(106%) contrast(107%)',
                ...sx
            }}
            src={icons[icon]}
            alt='icon'
        />
    )
})

RPGIcon.displayName = 'RPGIcon'
export default RPGIcon