const u = (id: string, w = 1920) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`

// Verified-resolving Unsplash photos (checked 2026-08-12).
export const IMG = {
  hero: u('1558494949-ef010cbdcc31'),            // data center aisle, blue glow
  systems: [
    u('1518770660439-4636190af475'),             // circuit board macro
    u('1550751827-4bd374c3f58b'),                // cyber security glow
    u('1526374965328-7f61d4dc18c5'),             // matrix code
    u('1593113598332-cd288d649433'),             // server racks
  ],
  demo: u('1541701494587-cb58502866ab'),         // liquid chrome paint
  footer: u('1636953056323-9c09fdd74fa6'),       // 3d chrome render
}

export const ALL_IMAGES = [
  IMG.hero,
  ...IMG.systems,
  IMG.demo,
  IMG.footer,
]
