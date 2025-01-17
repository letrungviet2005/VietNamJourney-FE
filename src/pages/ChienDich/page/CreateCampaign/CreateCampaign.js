import classNames from "classnames/bind";
import style from "./CreateCampaign.module.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { getCookie } from "../../../../Cookie/getCookie";
import {Alert, Button, Space} from 'antd';

const cx = classNames.bind(style);

function CreateCampaign() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    // Function to fetch data from JSON file
    const fetchData = async () => {
      try {
        const response = await axios.get("./json_data_vn_units.json");
        setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu JSON:", error);
      }
    };

    fetchData();
  }, []);

  const handleProvinceChange = (selectedOption) => {
    setSelectedProvince(selectedOption);
    // Find districts for selected province
    const selectedProvinceData = provinces.find(
      (province) => province.Code === selectedOption.value
    );
    if (selectedProvinceData) {
      setDistricts(selectedProvinceData.District);
      setSelectedDistrict(null); // Reset selected district when province changes
    }
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
  };

  // State để quản lý danh sách các thông tin liên hệ
  const [contacts, setContacts] = useState([]);

  // Hàm xử lý khi nhấn button "Thêm thông tin liên hệ"
  const handleAddContactClick = () => {
    setContacts([...contacts, { organizationName: "", contactEmail: "" }]);
  };

  // Hàm xử lý thay đổi thông tin tổ chức
  const handleNameChange = (index, e) => {
    const newContacts = [...contacts];
    newContacts[index].organizationName = e.target.value;
    setContacts(newContacts);
  };

  // Hàm xử lý thay đổi email liên hệ
  const handleEmailChange = (index, e) => {
    const newContacts = [...contacts];
    newContacts[index].contactEmail = e.target.value;
    setContacts(newContacts);
  };

  // State để quản lý danh sách các tổ chức hỗ trợ
  const [organizationContacts, setOrganizationContacts] = useState([]);

  // Hàm xử lý khi nhấn button "Thêm thông tin liên hệ"
  const handleAddOrganizationContact = () => {
    setOrganizationContacts([
      ...organizationContacts,
      { organizationName: "", contactEmail: "" },
    ]);
  };

  // Hàm xử lý thay đổi thông tin tên tổ chức
  const handleOrganizationNameChange = (index, e) => {
    const updatedOrganizationContacts = [...organizationContacts];
    updatedOrganizationContacts[index].organizationName = e.target.value;
    setOrganizationContacts(updatedOrganizationContacts);
  };

  // Hàm xử lý thay đổi email liên hệ
  const handleContactEmailChange = (index, e) => {
    const updatedOrganizationContacts = [...organizationContacts];
    updatedOrganizationContacts[index].contactEmail = e.target.value;
    setOrganizationContacts(updatedOrganizationContacts);
  };

  // State để lưu trữ URL của ảnh đã chọn
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Dùng để lưu file ảnh đã chọn

  // Hàm xử lý khi người dùng chọn ảnh
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setSelectedImage(imageURL);
      setImageFile(file); // Lưu file ảnh để gửi đi
    }
  };

  const navigate = useNavigate();

  // Hàm để gửi dữ liệu form lên API
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("userid", getCookie("User_ID"));
    formData.append("name", event.target.elements.name.value);
    formData.append("description", event.target.elements.desc.value);
    formData.append("plan", event.target.elements.plan.value);
    formData.append("dateStart", event.target.elements.dateStart.value);
    formData.append("dateEnd", event.target.elements.dateEnd.value);
    formData.append("totalMoney", event.target.elements.totalMoney.value);
    formData.append("moneyByVNJN", event.target.elements.moneyByVNJN.value);
    formData.append("province", selectedProvince ? selectedProvince.label : "");
    formData.append("district", selectedDistrict ? selectedDistrict.label : "");
    formData.append("location", event.target.elements.location.value);
    formData.append(
      "timeline",
      JSON.stringify([
        {
          title: "Giai đoạn ban đầu",
          value: event.target.elements.timelineGiaiDoanBanDau.value,
        },
        {
          title: "Bắt đầu dự án",
          value: event.target.elements.timelineBatDauDuAn.value,
        },
        {
          title: "Kết thúc dự án",
          value: event.target.elements.timelineKetThucDuAn.value,
        },
        {
          title: "Tổng kết dự án",
          value: event.target.elements.timelineTongKetDuAn.value,
        },
      ])
    );
    formData.append("infoContact", JSON.stringify(contacts));
    formData.append("infoOrganization", JSON.stringify(organizationContacts));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const response = await axios.post(
        "http://localhost:8000/api/createCampaign",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Phản hồi từ API:", response.data);
      if (response.data.success) {
        alert("Thêm chiến dịch thành công!");
        navigate('/Manager');
      } else {
        alert("Lỗi: " + response.data.error);
      }
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu lên API:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <div className={cx("CreateCampaign")}>
      <h1>Tạo chiến dịch mới</h1>

      <form onSubmit={handleSubmit}>
        <hr />
        <div className={cx("title")}>Thông tin tổng quan </div>
        <div className={cx("row")}>
          <div className={cx("col-2")}>
            <label htmlFor="name" className={cx("name")}>
              Tên chiến dịch:{" "}
            </label>
          </div>
          <div className={cx("col-10")}>
            <textarea
              type="text"
              id="name"
              name="name"
              className={cx("input-name")}
              required
            />
          </div>
        </div>
        <div className={cx("row")}>
          <div className={cx("col-2")}>
            <label htmlFor="desc" className={cx("desc")}>
              Mô tả chiến dịch:{" "}
            </label>
          </div>
          <div className={cx("col-10")}>
            <textarea
              type="text"
              id="desc"
              name="desc"
              className={cx("input-desc")}
              required
            />
          </div>
        </div>
        <div className={cx("row")}>
          <div className={cx("col-4", "date")}>
            <label htmlFor="dateStart" className={cx("dateStart")}>
              Ngày bắt đầu:{" "}
            </label>
            <input
              type="date"
              id="dateStart"
              name="dateStart"
              className={cx("input-dateStart")}
              required
            />
          </div>

          <div className={cx("col-4", "date")}>
            <label htmlFor="dateEnd" className={cx("dateEnd")}>
              Ngày kết thúc:{" "}
            </label>
            <input
              type="date"
              id="dateEnd"
              name="dateEnd"
              className={cx("input-dateEnd")}
              required
            />
          </div>
        </div>

        <div className={cx("where")}>
          <label htmlFor="province" className={cx("province")}>
            Tỉnh/thành phố:
          </label>
          <div className={cx("input-province")}>
            <Select
              id="province"
              options={provinces.map((province) => ({
                value: province.Code,
                label: province.Name,
              }))}
              value={selectedProvince}
              onChange={handleProvinceChange}
              placeholder="Chọn tỉnh/thành phố..."
              required
            />
          </div>

          <label htmlFor="district" className={cx("district")}>
            Huyện/quận:
          </label>
          <div className={cx("input-district")}>
            <Select
              id="district"
              options={districts.map((district) => ({
                value: district.Code,
                label: district.Name,
              }))}
              value={selectedDistrict}
              onChange={handleDistrictChange}
              placeholder="Chọn huyện/quận..."
              isDisabled={!selectedProvince}
              required
            />
          </div>
        </div>

        <div className={cx("money-row")}>
          <div className={cx("money")}>
            <label htmlFor="total-money" className={cx("total-money")}>
              Tổng giá trị dự án:{" "}
            </label>
            <input
              type="number"
              id="total-money"
              name="totalMoney"
              className={cx("input-total-money")}
              required
            />
          </div>

          <div className={cx("money")}>
            <label htmlFor="money-by-VNJN" className={cx("money-by-VNJN")}>
              Quỹ VIETNAM JOURNEY tài trợ:{" "}
            </label>
            <input
              type="number"
              id="money-by-VNJN"
              name="moneyByVNJN"
              className={cx("input-money-by-VNJN")}
              required
            />
          </div>
        </div>

        <hr />
        <div className={cx("title")}>Thông tin chi tiết </div>
        <div className={cx("row")}>
          <div className={cx("col-6", "timeline-row")}>
            <label htmlFor="timeline" className={cx("timeline")}>
              Thông tin các mốc thời gian:{" "}
            </label>
            <div className={cx("time")}>
              <label className={cx("inner-title")}>Giai đoạn ban đầu</label>
              <input className={cx("desc")} name="timelineGiaiDoanBanDau" />
              <label className={cx("inner-title")}>Bắt đầu dự án</label>
              <input className={cx("desc")} name="timelineBatDauDuAn" />
              <label className={cx("inner-title")}>Kết thúc dự án</label>
              <input className={cx("desc")} name="timelineKetThucDuAn" />
              <label className={cx("inner-title")}>Tổng kết dự án</label>
              <input className={cx("desc")} name="timelineTongKetDuAn" />
            </div>
          </div>

          <div className={cx("col-6")}>
            <label htmlFor="location" className={cx("location")}>
              Thông tin chi tiết về địa điểm:{" "}
            </label>
            <textarea
              type="text"
              id="location"
              name="location"
              className={cx("input-location")}
              required
            />
          </div>
        </div>

        <div className={cx("row")}>
          <div className={cx("col-2")}>
            <label htmlFor="plan" className={cx("desc")}>
              Kế hoạch chiến dịch:{" "}
            </label>
          </div>
          <div className={cx("col-10")}>
            <textarea
              type="text"
              id="plan"
              name="plan"
              className={cx("input-desc")}
              required
            />
          </div>
        </div>

        <div className={cx("row", "contact-row")}>
          <div className={cx("col-6")}>
            <hr />
            <div className={cx("title")}>Thông tin liên hệ </div>
            <button
              className={cx("contact")}
              type="button"
              onClick={handleAddContactClick}
            >
              Thêm thông tin liên hệ <i class="fa-solid fa-circle-plus"></i>
            </button>

            {contacts.map((contact, index) => (
              <div key={index} className={cx("form", "form-contact")}>
                <input
                  type="text"
                  id={`contactName-${index}`}
                  value={contact.organizationName}
                  onChange={(e) => handleNameChange(index, e)}
                  className={cx("form-control")}
                  placeholder="Tên đại diện"
                  required
                />
                <input
                  type="email"
                  id={`contactEmail-${index}`}
                  value={contact.contactEmail}
                  onChange={(e) => handleEmailChange(index, e)}
                  className={cx("form-control")}
                  placeholder="Email"
                  required
                />
              </div>
            ))}
          </div>

          <div className={cx("col-6")}>
            <hr />
            <div className={cx("title")}>Các tổ chức hỗ trợ thực hiện</div>
            <button
              className={cx("contact-orgnazation")}
              type="button"
              onClick={handleAddOrganizationContact}
            >
              Thêm thông tin liên hệ <i class="fa-solid fa-circle-plus"></i>
            </button>

            {organizationContacts.map((organization, index) => (
              <div key={index} className={cx("form", "form-contact")}>
                <input
                  type="text"
                  id={`organizationName-${index}`}
                  value={organization.organizationName}
                  onChange={(e) => handleOrganizationNameChange(index, e)}
                  className={cx("form-control")}
                  placeholder="Tên tổ chức"
                  required
                />
                <input
                  type="email"
                  id={`organizationEmail-${index}`}
                  value={organization.contactEmail}
                  onChange={(e) => handleContactEmailChange(index, e)}
                  className={cx("form-control")}
                  placeholder="Email"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className={cx("image-upload-container")}>
          <div className={cx("button-container")}>
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              name="image"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <label htmlFor="fileInput" className={cx("image-upload-button")}>
              Chọn ảnh
            </label>
          </div>
          {selectedImage && (
            <div className={cx("image-preview-container")}>
              <img
                src={selectedImage}
                alt="Ảnh đã chọn"
                className={cx("image-preview")}
              />
            </div>
          )}
        </div>

        <button type="submit" className={cx("submit-button")}>
          Tạo chiến dịch
        </button>
      </form>
    </div>
  );
}

export default CreateCampaign;
