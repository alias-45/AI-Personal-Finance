

export const API_KEYS = {
 
  newsApi: "5e528dd35d6548b693e2494ca379463b",


  alphavantage: "6f2393fdeb2449afa76ee627b733e983",
};

export const isKeyConfigured = (key: string): boolean => {
  return key && key !== "" && !key.startsWith("YOUR_");
};