    # Functional Requirements cho MVP của Ứng dụng Đặt lịch Khám bệnh

    ## Tính năng chung cho tất cả người dùng

    | ID   | Tính năng                | Mô tả                                                                     | Độ ưu tiên | Dependencies |
    | ---- | ------------------------ | ------------------------------------------------------------------------- | ---------- | ------------ |
    | FR01 | Đăng ký tài khoản        | Cho phép người dùng tạo tài khoản với vai trò cụ thể (bệnh nhân/bác sĩ)   | Cao        | Không có     |
    | FR02 | Đăng nhập/Xác thực       | Cho phép người dùng đăng nhập vào hệ thống với xác thực 2 lớp             | Cao        | FR01         |
    | FR03 | Quản lý hồ sơ người dùng | Cho phép người dùng xem và chỉnh sửa thông tin cá nhân, thông tin liên hệ | Cao        | FR01, FR02   |
    | FR04 | Phân quyền người dùng    | Phân biệt vai trò: bệnh nhân và bác sĩ với các quyền truy cập khác nhau   | Cao        | FR01, FR02   |
    | FR05 | Đăng xuất                | Cho phép người dùng đăng xuất khỏi hệ thống an toàn                       | Trung bình | FR02         |
    | FR06 | Đổi mật khẩu             | Cho phép người dùng thay đổi mật khẩu với xác thực bảo mật                | Trung bình | FR02         |
    | FR07 | Quên mật khẩu            | Cho phép người dùng khôi phục mật khẩu qua email/SMS                      | Trung bình | FR01         |
    | FR08 | Thông báo trong ứng dụng | Hiển thị thông báo realtime về lịch hẹn, nhắc nhở, cập nhật               | Cao        | FR02         |

    ## Tính năng dành cho Bệnh nhân

    | ID   | Tính năng                   | Mô tả                                                                    | Độ ưu tiên | Dependencies |
    | ---- | --------------------------- | ------------------------------------------------------------------------ | ---------- | ------------ |
    | FR09 | Tạo hồ sơ bệnh nhân         | Cho phép tạo và cập nhật thông tin y tế cá nhân, tiền sử bệnh            | Cao        | FR03         |
    | FR10 | Tìm kiếm bác sĩ/phòng khám  | Tìm kiếm theo chuyên khoa, địa điểm, đánh giá, thời gian làm việc        | Cao        | Không có     |
    | FR11 | Xem thông tin bác sĩ        | Hiển thị chi tiết về bác sĩ: chuyên môn, kinh nghiệm, đánh giá, giá khám | Cao        | FR10         |
    | FR12 | Xem lịch trống của bác sĩ   | Hiển thị các khung giờ có thể đặt lịch theo ngày, tuần                   | Cao        | FR11         |
    | FR13 | Đặt lịch khám bệnh          | Cho phép đặt lịch hẹn với bác sĩ, chọn thời gian và lý do khám           | Cao        | FR09, FR12   |
    | FR14 | Xem lịch hẹn đã đặt         | Hiển thị danh sách các lịch hẹn: sắp tới, đã hoàn thành, đã hủy          | Cao        | FR13         |
    | FR15 | Sửa/Hủy lịch hẹn            | Cho phép thay đổi hoặc hủy lịch hẹn (theo quy định thời gian)            | Cao        | FR14         |
    | FR16 | Nhắc nhở tự động            | Gửi thông báo nhắc nhở qua email/SMS trước giờ khám (1 ngày, 2 giờ)      | Cao        | FR13         |
    | FR17 | Thanh toán trực tuyến       | Tích hợp cổng thanh toán để thanh toán phí khám bệnh                     | Cao        | FR13         |
    | FR18 | Xem lịch sử thanh toán      | Hiển thị lịch sử các giao dịch thanh toán, hóa đơn                       | Trung bình | FR17         |
    | FR19 | Đánh giá bác sĩ             | Cho phép đánh giá và nhận xét về bác sĩ sau khi khám                     | Trung bình | FR14         |
    | FR20 | Xem hồ sơ khám bệnh         | Xem lịch sử khám bệnh, kết quả xét nghiệm, đơn thuốc                     | Cao        | FR09         |
    | FR21 | Tải xuống hóa đơn/đơn thuốc | Cho phép tải file PDF hóa đơn, đơn thuốc, kết quả xét nghiệm             | Trung bình | FR20         |
    | FR22 | Đặt lịch tái khám           | Đặt lịch hẹn tái khám theo yêu cầu của bác sĩ                            | Trung bình | FR20         |
    | FR23 | Chia sẻ hồ sơ y tế          | Cho phép chia sẻ thông tin y tế với bác sĩ khác (với sự đồng ý)          | Thấp       | FR20         |

    ## Tính năng dành cho Bác sĩ

    | ID   | Tính năng                      | Mô tả                                                                 | Độ ưu tiên | Dependencies |
    | ---- | ------------------------------ | --------------------------------------------------------------------- | ---------- | ------------ |
    | FR24 | Tạo hồ sơ bác sĩ               | Tạo và cập nhật thông tin chuyên môn, bằng cấp, kinh nghiệm, giá khám | Cao        | FR03         |
    | FR25 | Thiết lập lịch làm việc        | Cấu hình khung giờ làm việc, ngày nghỉ, thời gian cho mỗi ca khám     | Cao        | FR24         |
    | FR26 | Quản lý lịch hẹn               | Xem danh sách lịch hẹn theo ngày/tuần/tháng, trạng thái các cuộc hẹn  | Cao        | FR25         |
    | FR27 | Xác nhận/Từ chối lịch hẹn      | Chấp nhận hoặc từ chối yêu cầu đặt lịch từ bệnh nhân                  | Cao        | FR26         |
    | FR28 | Xem thông tin bệnh nhân        | Truy cập hồ sơ y tế, tiền sử bệnh của bệnh nhân trước khi khám        | Cao        | FR26         |
    | FR29 | Ghi chú khám bệnh              | Nhập kết quả khám, chẩn đoán, hướng điều trị vào hồ sơ bệnh nhân      | Cao        | FR28         |
    | FR30 | Kê đơn thuốc điện tử           | Tạo đơn thuốc điện tử với thông tin chi tiết thuốc, liều dùng         | Cao        | FR29         |
    | FR31 | In hóa đơn khám bệnh           | Tạo và in hóa đơn cho bệnh nhân sau khi hoàn thành khám               | Cao        | FR29         |
    | FR32 | Lên lịch tái khám              | Đặt lịch hẹn tái khám cho bệnh nhân khi cần thiết                     | Trung bình | FR29         |
    | FR33 | Thống kê thu nhập              | Xem báo cáo doanh thu theo ngày/tháng/năm                             | Trung bình | FR31         |
    | FR34 | Quản lý bệnh nhân thường xuyên | Danh sách bệnh nhân đã từng khám, thông tin liên lạc                  | Trung bình | FR28         |
    | FR35 | Gửi thông báo cho bệnh nhân    | Gửi thông báo nhắc nhở, kết quả xét nghiệm qua ứng dụng               | Trung bình | FR28         |
    | FR36 | Xuất báo cáo bệnh nhân         | Xuất danh sách bệnh nhân, thống kê khám bệnh ra file Excel/PDF        | Thấp       | FR34         |
