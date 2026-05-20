/**
 * نظام موزع لإرسال التنبيهات إلى التيلغرام (Orders & Feedback)
 * معالجة احترافية لـ Query Parameters وترويسات الـ CORS لمنع حظر المتصفحات
 */

function doPost(e) {
  // الترويسات القياسية للسماح للموقع الخارجي بالاتصال دون قيود CORS
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    var path = "";

    // محاولة استخراج kind من المعاملات المباشرة
    if (e && e.parameter && e.parameter.kind) {
      path = String(e.parameter.kind);
    } 
    
    // حل مشكلة اختفاء المعاملات في الـ POST: فحص الـ queryString الخام
    if (!path && e && e.queryString) {
      var pairs = e.queryString.split("&");
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("=");
        if (decodeURIComponent(pair[0]).toLowerCase() === "kind" && pair[1]) {
          path = decodeURIComponent(pair[1]);
          break;
        }
      }
    }

    // تحويل النص لحروف صغيرة لضمان مطابقة مرنة وغير حساسة لحالة الأحرف
    path = (path || "").toLowerCase().trim();

    // تحليل محتوى الـ Body القادم من الموقع
    var body = {};
    try {
      body = JSON.parse(e && e.postData ? e.postData.contents : "{}");
    } catch (x2) {
      body = {};
    }

    // دعم استخراج النص سواء أكان مرسلاً في حقل text أو تم تمرير نوع الخدمة بالداخل أيضاً
    var text = String(body && body.text ? body.text : "").trim();
    if (!text && body.message) text = String(body.message).trim(); // خيار احتياطي
    
    // إذا كان الحقل النصي فارغاً تماماً
    if (!text) {
      return json_(400, { ok: false, error: "EMPTY_TEXT" }, headers);
    }

    // إذا تم تمرير الـ kind داخل الـ Body كخيار إضافي مستقبلي
    if (!path && body && body.kind) {
      path = String(body.kind).toLowerCase().trim();
    }

    // بيانات الاعتماد والتوكنز الخاصة بالتيلغرام
    var ORDERS_TOKEN   = "8675164937:AAF8UXeY1eiLoQB-Xz9D_DCA1UaxLJT0jIE";
    var FEEDBACK_TOKEN = "8616081018:AAHqmN-X0IkBMfYKs8tcrQV1o_e7PS6U3VQ";
    var CHAT_ID        = "2067991553";

    // تحديد التوكن المناسب بناءً على النفق الصحيح للطلب
    var token = (path === "orders") ? ORDERS_TOKEN : FEEDBACK_TOKEN;

    // التحقق من سلامة التوكن
    if (!token || token.indexOf("PUT_") === 0) {
      return json_(500, { ok: false, error: "TOKEN_NOT_SET" }, headers);
    }

    // بناء وتجهيز طلب الـ API لسيرفرات التيلغرام
    var url = "https://api.telegram.org/bot" + token + "/sendMessage";
    var payload = {
      chat_id: CHAT_ID,
      text: text,
      disable_web_page_preview: true,
      parse_mode: "HTML" // تتيح لك تنسيق الرسائل بشكل أنيق إن أردت
    };

    var res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    var code = res.getResponseCode();
    
    if (code >= 200 && code < 300) {
      return json_(200, { ok: true, route: path }, headers);
    }
    
    return json_(500, { 
      ok: false, 
      error: "TELEGRAM_SEND_FAILED", 
      status: code, 
      body: res.getContentText() 
    }, headers);

  } catch (err) {
    return json_(500, { ok: false, error: "CRASH", details: err.toString() }, headers);
  }
}

/**
 * دالة التعامل مع طلبات GET القياسية
 */
function doGet(e) {
  var headers = { "Access-Control-Allow-Origin": "*" };
  return json_(200, { ok: true, message: "HJY System Active" }, headers);
}

/**
 * دالة الاستجابة لطلبات OPTIONS (Preflight) لمنع أخطاء المتصفحات تماماً
 */
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

/**
 * دالة مساعدة لتوليد استجابة JSON احترافية ومدمج بها الترويسات
 */
function json_(status, obj, headers) {
  var output = ContentService.createTextOutput(JSON.stringify(obj))
                             .setMimeType(ContentService.MimeType.JSON);
  if (headers) {
    output.setHeaders(headers);
  }
  return output;
}
