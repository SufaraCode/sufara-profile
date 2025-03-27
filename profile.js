console.log("✅ profile.js loaded!");

// ✅ تهيئة Firebase
const functions = firebase.app().functions("us-central1");
const saveProfileData = functions.httpsCallable("saveProfileData");

// ✅ فحص بيانات المستخدم عند تحميل الصفحة
async function checkUserData() {
  const user = firebase.auth().currentUser;
  if (!user) {
    window.location.href = "/login"; // لو مش مسجل، رجّعه لصفحة تسجيل الدخول
    return;
  }

  const docRef = firebase.firestore().collection("users").doc(user.uid);
  const doc = await docRef.get();

  // ✅ إذا ما في بيانات محفوظة → افتح النافذة
  if (!doc.exists || !doc.data().phone) {
    document.getElementById("profilePopup").style.display = "flex";
  } else {
    // ✅ تحميل البيانات وعرضها
    loadUserData();
  }
}

// ✅ حفظ البيانات عند إرسال الفورم
document.getElementById("profileForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const university = document.getElementById("university").value.trim();
  const major = document.getElementById("major").value.trim();

  try {
    // ✅ استدعاء Cloud Function
    const result = await saveProfileData({ name, phone, university, major });
    console.log(result.data.message);

    // ✅ إخفاء النافذة بعد الحفظ
    document.getElementById("profilePopup").style.display = "none";
    alert(result.data.message);

    // ✅ إعادة تحميل البيانات لتحديث الصفحة
    loadUserData();
  } catch (error) {
    console.error("🚨 خطأ أثناء حفظ البيانات:", error.message);
    alert("حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.");
  }
});

// ✅ تحميل بيانات المستخدم عند فتح الصفحة
async function loadUserData() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const docRef = firebase.firestore().collection("users").doc(user.uid);
  const doc = await docRef.get();

  if (doc.exists) {
    const data = doc.data();

    // ✅ عرض البيانات في البروفايل
    document.getElementById("displayName").textContent = `👤 اسمك: ${data.username || "غير متوفر"}`;
    document.getElementById("displayPhone").textContent = `📞 رقمك: ${data.phone || "غير متوفر"}`;
    document.getElementById("displayUniversity").textContent = `🏫 جامعتك: ${data.university || "غير متوفر"}`;
    document.getElementById("displayMajor").textContent = `🎓 تخصصك: ${data.major || "غير متوفر"}`;
  }
}

// ✅ التحقق من البيانات عند تحميل الصفحة
window.onload = checkUserData;
