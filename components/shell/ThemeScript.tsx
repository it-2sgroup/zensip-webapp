/**
 * Đặt class giao diện tối TRƯỚC khi trang vẽ lần đầu, tránh nháy nền trắng.
 *
 * KHÔNG có "use client" ở đầu file — đây phải là server component.
 * Nếu để trong file client, React 19 sẽ cố render thẻ <script> ở phía trình
 * duyệt và báo lỗi "Encountered a script tag while rendering React component"
 * (script trong component client không bao giờ được thực thi).
 * Là server component thì thẻ script chỉ nằm trong HTML gửi về, chạy đúng
 * một lần lúc tải trang — đúng thứ ta cần.
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('zensip-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
