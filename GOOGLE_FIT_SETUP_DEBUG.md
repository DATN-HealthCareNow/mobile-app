# Google Fit Integration - Debug & Setup Checklist

## Lỗi 403 Khi Sync Data

Nếu gặp lỗi `403 Forbidden`, điều này có nghĩa là **token không có quyền truy cập Google Fit API**.

### ✅ Kiểm tra danh sách (Debug Steps)

#### 1. **Google Cloud Project Setup**
```
[ ] Truy cập https://console.cloud.google.com
[ ] Chọn project: HealthCareNow (hoặc tên project của bạn)
[ ] Vào menu "APIs & Services" > "Library"
[ ] Tìm "Google Fit API" và bấm "ENABLE"
[ ] Xác nhận trạng thái: "API Enabled" (nút bình thường)
```

#### 2. **OAuth Consent Screen**
```
[ ] Vào "APIs & Services" > "OAuth consent screen"
[ ] Chọn "User Type: External"
[ ] Điền:
    - App name: HealthCareNow
    - User support email: your-email@gmail.com
    - Developer contact: your-email@gmail.com
[ ] Ở mục "Scopes", thêm các scope này:
    - https://www.googleapis.com/auth/fitness.activity.read
    - https://www.googleapis.com/auth/fitness.body.read
    - https://www.googleapis.com/auth/fitness.heart_rate.read
    - https://www.googleapis.com/auth/fitness.sleep.read
[ ] Save and Continue
[ ] Thêm test users (email của bạn)
```

#### 3. **Android OAuth 2.0 Credentials**
```
[ ] Vào "APIs & Services" > "Credentials"
[ ] Bấm "Create Credentials" > "OAuth 2.0 Client ID"
[ ] Chọn "Android"
[ ] Điền:
    - Package name: com.danhvip2k4.mobileapp
    - SHA-1 certificate fingerprint: <xem hướng dẫn bên dưới>
[ ] Create > Copy "Client ID"
```

#### 4. **Lấy SHA-1 Certificate Fingerprint**
```bash
# Windows (PowerShell)
$keystorePath = "$env:USERPROFILE\.android\debug.keystore"
keytool -list -v -alias androiddebugkey -keystore $keystorePath -storepass android -keypass android

# Linux/Mac
keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android

# Copy SHA1 value (format: AA:BB:CC:DD:...)
```

#### 5. **Web Client ID Configuration**
```
[ ] Vào "Credentials" > tìm "Web application" credential
[ ] Copy "Client ID"
[ ] Thêm vào file: mobile-app/.env.local
    EXPO_PUBLIC_WEB_CLIENT_ID=<your-web-client-id>
```

#### 6. **Test Token Scope**
```bash
# Sau khi rebuild, kiểm tra log console:
# Tìm dòng này:
# [useGoogleFit] Scopes requested: fitness.activity.read, fitness.body.read, ...

# Nếu log này hiển thị, scopes được request đúng
```

---

## Nếu Vẫn Gặp 403

### Bước sửa chữa

1. **Force re-authenticate**
   - App sẽ tự động yêu cầu sign-in lại khi 403 lần 2
   - Bấm "Accept" khi Google yêu cầu xác nhận scope

2. **Clear cache & rebuild**
   ```bash
   eas build --platform android --clear-cache
   ```

3. **Kiểm tra log chi tiết**
   - Mở app
   - Bấm "Sync Now"
   - Gửi log từ **Console** hoặc **Terminal** (nếu chạy local)

4. **Reset Google Sign-in**
   - Settings app > Apps > HealthCareNow > Storage > Clear Cache
   - Đóng app hoàn toàn
   - Mở lại, bấm login Google, chọn "Accept" tất cả permissions

---

## Log Output Cần Kiểm Tra

✅ **Bình thường (Success)**
```
[useGoogleFit] User signed in: your-email@gmail.com
[useGoogleFit] Access token received: abc123def456...
[useGoogleFit] Scopes requested: fitness.activity.read, fitness.body.read, ...
[useGoogleFit] ✅ Final parsed result: { steps: 5000, calories: 250, ... }
```

❌ **Lỗi Scope (403)**
```
[useGoogleFit] ⚠️ 403 Forbidden detected. Attempt #1
[useGoogleFit] 🔄 Attempt 1: Attempting token refresh...
[useGoogleFit] ✅ Token auto-refreshed. Retrying...
[useGoogleFit] ⚠️ 403 Forbidden detected. Attempt #2
[useGoogleFit] ⚠️ Attempt 2: Forcing re-authentication...
→ App sẽ trigger Google Sign-in lại
```

---

## Quick Restart

Nếu không muốn từng bước, chạy này:
```bash
# 1. Clear local state
$env:EXPO_CLEAR_CACHE = "1"
eas build --platform android

# 2. Sau khi build xong:
# - Install APK mới
# - Clear app storage
# - Mở app, login Google lại
# - Lần này Google sẽ yêu cầu "Allow" scopes, bấm Accept
# - Bấm Sync Now
```

---

## Liên hệ Support
Nếu vẫn lỗi, chia sẻ:
1. Email Google (used in sign-in)
2. Project ID từ Google Cloud Console
3. SHA-1 fingerprint hiện tại
4. Full log từ Console khi Sync
