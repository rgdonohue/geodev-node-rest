const FedlandPSBBOC = require('../models/fedlandPSBBOC');

const knexConfig = require('../knexfile.js');
const Knex = require('knex');
const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);

module.exports = {

  getFedlandPSBBOC: async (req, res, next) => {

    const owner_code = req.value.body.owner_code;
    const left_lng = req.value.body.left_lng;
    const bottom_lat = req.value.body.bottom_lat;
    const right_lng = req.value.body.right_lng;
    const top_lat = req.value.body.top_lat;
    const simplification = req.value.body.simplification;
    const geojson_digits = req.value.body.geojson_digits;
    const srid = req.value.body.srid;

    // {
    // 	"owner_code" : "NPS",
    // 	"left_lng" : -109.044926,
    // 	"bottom_lat" : 36.999016,
    // 	"right_lng" : -102.051515,
    // 	"top_lat" : 41.001666,
    // 	"simplification" : 0.001,
    // 	"geojson_digits" : 3,
    // 	"srid" : 4326
    // }

    // 1.0 to 0.001, simple to complex
    // ST_MakeEnvelope(left_lng, bottom_lat, right_lng, top_lat, 4326)

    var   sql =  " select id, ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, " + simplification + "), " + geojson_digits + ") as geojson, owner, owner_code, name, state, state_fips ";
          sql += " from fedland_postgis ";
          sql += " where owner_code = '" + owner_code + "' ";
          sql += " AND ST_SimplifyPreserveTopology(geom, " + simplification + ") && ST_MakeEnvelope(" + left_lng + ", " + bottom_lat + ", " + right_lng + ", " + top_lat + ", " + srid + "); ";

    const result = await knex.raw(sql);
    const fedlands = [];
    for(var feature in result.rows) {
      fedlands[feature] = result.rows[feature];
    }

    var fedlandsFC = getFeatureCollectionFor(fedlands);
    res.status(200).json(fedlandsFC);

  }
};

function getFeatureCollectionFor(coll) {

  var features = [];

  for(item in coll) {
    feature = {
      "type": "Feature",
      "geometry": {
        "type": JSON.parse(coll[item].geojson).type,
        "coordinates": JSON.parse(coll[item].geojson).coordinates
      },
      "properties": {
        "_id": coll[item]._id,
        "owner_code": coll[item].owner_code,
        "owner": coll[item].owner,
        "name": coll[item].name,
        "state": coll[item].state,
        "state_fips": coll[item].state_fips
      }
    };
    features.push(feature);
  }

  var featureCollection = {
    "type": "FeatureCollection",
    "features": features
  };

  return featureCollection;

}
