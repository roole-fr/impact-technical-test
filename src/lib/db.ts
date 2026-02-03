export async function queryStrapiDb(sql: string): Promise<any> {

    console.log("DB QUERY", sql);
  
    // mock: on fait semblant d'interroger une base
    if (sql.includes("donations")) {
      return { found: false };
    }
    return null;
  }
  