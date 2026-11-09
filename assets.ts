function getImage(imgId: string): Image {
    const img = helpers.getImageByName(imgId.toLowerCase());
    if (!img) throw "Unknown image ID: " + imgId;
    return img;
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