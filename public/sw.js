"v2.2.0"; //change version each master release
const store = ["/","bigoil.html","index.html","mask.html","mobile.html","css/bigoil.css","css/common.css","css/desktop.css","css/fonts.css","css/fonts/CC.ttf","css/fonts/DINEngschrift.ttf","css/fonts/Padaloma.ttf","css/mask.css","css/mobile.css","css/offsets.css","css/pd2table.css","db/ar.json","db/armors.json","db/deployables.json","db/perk_cards.json","db/perk_decks.json","db/primaries.json","db/shot_specials.json","db/skills.json","db/throwables.json","img/armors/ballistic.png","img/armors/ctv.png","img/armors/flak.png","img/armors/heavy_ballistic.png","img/armors/ictv.png","img/armors/light_ballistic.png","img/armors/suit.png","img/bg.png","img/borders/border.png","img/borders/corner-bottomleft.png","img/borders/corner-bottomright.png","img/borders/corner-topleft.png","img/borders/corner-topright.png","img/borders/skill_border.png","img/crews/deployables.png","img/crews/perks.png","img/deployables/ammo_bag.png","img/deployables/armor_kit.png","img/deployables/bodybags_bag.png","img/deployables/doctor_bag.png","img/deployables/ecm_jammer.png","img/deployables/first_aid_kit.png","img/deployables/sentry_gun.png","img/deployables/sentry_gun_silent.png","img/deployables/trip_mine.png","img/dropdown-arrow.png","img/favicon.png","img/lock_skill.png","img/masks/colors_icons.png","img/masks/colors_ui.png","img/perks/card.png","img/perks/icons.png","img/risk.png","img/skills/ace.png","img/skills/background.png","img/skills/background-90deg.png","img/skills/icons.png","img/skills/icons_atlas.png","img/skills/icons_small.png","img/skills/main.png","img/skills/padlock.png","img/throwables/ace_of_spades.png","img/throwables/concussion_grenade.png","img/throwables/dynamite.png","img/throwables/frag_grenade.png","img/throwables/gas_dispenser.png","img/throwables/hef_frag_grenade.png","img/throwables/incendiary_grenade.png","img/throwables/injector.png","img/throwables/javelin.png","img/throwables/leech_ampule.png","img/throwables/matryushka_grenade.png","img/throwables/molotov.png","img/throwables/pocket_ecm.png","img/throwables/shuriken.png","img/throwables/smoke_bomb.png","img/throwables/stoic_hip_flask.png","img/throwables/throwing_axe.png","img/throwables/throwing_knife.png","img/throwables/x1_zapper.png","js/bigoil.js","js/Builder.js","js/GUI.js","js/index.js","js/IO.js","js/Language.js","js/mask.js","js/MaskControls.js","js/PaydayTable.js","js/Stats.js","js/Util.js","lang/en-us.json","lang/es-es.json","lang/fil-ph.json","lang/ru-ru.json","lang/zh-cn.json","manifest.webmanifest","models/alienware_df.png","models/alienware_dfa.png","models/alienware_nm.png","models/matcap_plastic_df.png","models/msk_alienware.bin","models/msk_alienware.gltf"];

self.addEventListener("install", ev => {
    self.skipWaiting();
    ev.waitUntil(
        caches.open("v1").then(cache => 
            cache.addAll(store)
        )
    );
    // Just in case of CDN propagation
    setTimeout(() => {
        caches.open("v1").then(cache => 
            cache.addAll(store)
        );
    }, 15 * 60 * 1000);
});

self.addEventListener("fetch", ev => {
    ev.respondWith(checkCacheOrFetch(ev));
});

async function checkCacheOrFetch(ev) {
    const match = await (await caches.open("v1")).match(ev.request, { ignoreSearch: true });
    if(match === undefined) {
        return fetch(ev.request.clone())
            .then(r =>
                caches.open("v1").then(cache => {
                    cache.put(ev.request.url.replace(/\?.*/, ""), r.clone());
                    return r;
                })
            );
    }
    return match;
}
