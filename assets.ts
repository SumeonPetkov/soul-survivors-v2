function getImage(imgId: string): Image {
    // exact name first, so camelCase editor names like "myImage7" work
    const img = helpers.getImageByName(imgId) || helpers.getImageByName(imgId.toLowerCase());
    if (!img) throw "Unknown image ID: " + imgId;
    return img;
}

/** Returns a resized copy of `src` (nearest-neighbour). factor 0.7 = 30% smaller. */
function scaleImage(src: Image, factor: number): Image {
    const w = Math.max(1, Math.round(src.width * factor));
    const h = Math.max(1, Math.round(src.height * factor));
    const out = image.create(w, h);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
            out.setPixel(x, y, src.getPixel(Math.floor(x / factor), Math.floor(y / factor)));
    return out;
}

function getTile(tileId: string): Image {
    const img = helpers.getTileByName(tileId.toLowerCase());
    if (!img) throw "Unknown tile ID: " + tileId;
    return img;
}

function getTilemap(tileId: string): tiles.TileMapData {
    const tilemap = helpers.getTilemapByName(tileId.toLowerCase());
    if (!tilemap) throw "Unknown tilemap ID: " + tileId;
    return tilemap;
}