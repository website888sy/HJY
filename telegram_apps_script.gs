function doPost(e) {
  try {
    var path = "";
    try {
      path = String(e && e.parameter && e.parameter.kind ? e.parameter.kind : "");
    } catch (x) {
      path = "";
    }
    path = (path || "").toLowerCase();
    var body = {};
    try {
      body = JSON.parse(e && e.postData ? e.postData.contents : "{}");
    } catch (x2) {
      body = {};
    }
    var text = String(body && body.text ? body.text : "").trim();
    if (!text) return json_(400, { ok: false, error: "EMPTY" });

    var ORDERS_TOKEN = "PUT_ORDERS_BOT_TOKEN_HERE";
    var FEEDBACK_TOKEN = "PUT_FEEDBACK_BOT_TOKEN_HERE";
    var CHAT_ID = "2067991553";

    var token = path === "orders" ? ORDERS_TOKEN : FEEDBACK_TOKEN;
    if (!token || token.indexOf("PUT_") === 0) return json_(500, { ok: false, error: "TOKEN_NOT_SET" });

    var url = "https://api.telegram.org/bot" + token + "/sendMessage";
    var payload = {
      chat_id: CHAT_ID,
      text: text,
      disable_web_page_preview: true,
    };
    var res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
    var code = res.getResponseCode();
    if (code >= 200 && code < 300) return json_(200, { ok: true });
    return json_(500, { ok: false, error: "SEND_FAILED", status: code, body: res.getContentText() });
  } catch (err) {
    return json_(500, { ok: false, error: "CRASH" });
  }
}

function doGet() {
  return json_(200, { ok: true });
}

function json_(status, obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
