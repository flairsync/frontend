// /pages/movies/+data.js

export { data };

// Note how we use `node-fetch`; this file is only run on the server-side, thus we don't need
// to use an isomorphic (aka universal) implementation such as `cross-fetch`.
import axios from "axios";

async function data(pageContext) {
  try {
    const busId = pageContext.routeParams.id;
    const response = await axios.get(
      `https://api.flairsync.com/api/v1/business/${busId}/metadata`
    );

    let resp = await response.data;

    const busMeta = resp.data;
    return {
      businessMeta: busMeta,
    };
  } catch (error) {
    return {
      businessMeta: null,
    };
  }
}
