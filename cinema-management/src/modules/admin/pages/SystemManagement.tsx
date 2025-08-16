import {formatApiService, type Format } from "@/services/formatApi";
import {languageApiService , type Language} from "@/services/languageApi";
import { Edit, Flag, Languages, Plus, Settings, Tags, Trash2, Users, Video } from "lucide-react";
import React, { useEffect, useState } from "react";

const SystemManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("countries");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);


  useEffect(() => {
    fetchLanguages();
    fetchFormats();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await languageApiService.getAllLanguages();
      setLanguages(response);
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const fetchFormats = async () => {
    try {
      const response = await formatApiService.getAllFormats();
      setFormats(response);
    } catch (error) {
      console.error("Error fetching formats:", error);
    }
  };

  // Mock data for each tab
  const mockData = {
    countries: [
      { id: 1, name: "Việt Nam", code: "VN", status: "active", movies: 25 },
      { id: 2, name: "Hoa Kỳ", code: "US", status: "active", movies: 145 },
      { id: 3, name: "Hàn Quốc", code: "KR", status: "active", movies: 68 },
      { id: 4, name: "Nhật Bản", code: "JP", status: "active", movies: 42 },
      { id: 5, name: "Trung Quốc", code: "CN", status: "active", movies: 33 },
      { id: 6, name: "Thái Lan", code: "TH", status: "active", movies: 18 },
      { id: 7, name: "Pháp", code: "FR", status: "inactive", movies: 12 }
    ],
    // formats: [
    //   { id: 1, name: "2D", description: "Định dạng phim 2D truyền thống", status: "active", theaters: 15 },
    //   { id: 2, name: "3D", description: "Định dạng phim 3D", status: "active", theaters: 12 },
    //   { id: 3, name: "IMAX", description: "Định dạng IMAX siêu rộng", status: "active", theaters: 3 },
    //   { id: 4, name: "4DX", description: "Định dạng 4DX với hiệu ứng vật lý", status: "active", theaters: 2 },
    //   { id: 5, name: "ScreenX", description: "Định dạng ScreenX 270 độ", status: "active", theaters: 1 },
    //   { id: 6, name: "Dolby Cinema", description: "Định dạng Dolby Cinema", status: "inactive", theaters: 0 }
    // ],
    genres: [
      { id: 1, name: "Hành động", description: "Phim hành động, võ thuật", status: "active", movies: 85 },
      { id: 2, name: "Tình cảm", description: "Phim tình cảm, lãng mạn", status: "active", movies: 62 },
      { id: 3, name: "Kinh dị", description: "Phim kinh dị, ma quái", status: "active", movies: 34 },
      { id: 4, name: "Hài kịch", description: "Phim hài, hài kịch", status: "active", movies: 45 },
      { id: 5, name: "Khoa học viễn tưởng", description: "Phim khoa học viễn tưởng", status: "active", movies: 38 },
      { id: 6, name: "Hoạt hình", description: "Phim hoạt hình, animation", status: "active", movies: 28 },
      { id: 7, name: "Tâm lý", description: "Phim tâm lý, drama", status: "active", movies: 41 },
      { id: 8, name: "Phiêu lưu", description: "Phim phiêu lưu, mạo hiểm", status: "active", movies: 29 }
    ],
    // languages: [
    //   { id: 1, name: "Tiếng Việt", code: "vi", status: "active", movies: 45 },
    //   { id: 2, name: "Tiếng Anh", code: "en", status: "active", movies: 185 },
    //   { id: 3, name: "Tiếng Hàn", code: "ko", status: "active", movies: 68 },
    //   { id: 4, name: "Tiếng Nhật", code: "ja", status: "active", movies: 42 },
    //   { id: 5, name: "Tiếng Trung", code: "zh", status: "active", movies: 33 },
    //   { id: 6, name: "Tiếng Thái", code: "th", status: "active", movies: 18 },
    //   { id: 7, name: "Tiếng Pháp", code: "fr", status: "inactive", movies: 8 }
    // ],
    limitages: [
      { id: 1, name: "P - Phổ biến", description: "Phim dành cho mọi lứa tuổi", minAge: 0, status: "active", movies: 65 },
      { id: 2, name: "K - Kho khan", description: "Phim không dành cho trẻ em dưới 13 tuổi", minAge: 13, status: "active", movies: 82 },
      { id: 3, name: "T13 - Teen 13+", description: "Phim dành cho lứa tuổi 13+", minAge: 13, status: "active", movies: 78 },
      { id: 4, name: "T16 - Teen 16+", description: "Phim dành cho lứa tuổi 16+", minAge: 16, status: "active", movies: 94 },
      { id: 5, name: "T18 - Teen 18+", description: "Phim dành cho lứa tuổi 18+", minAge: 18, status: "active", movies: 46 },
      { id: 6, name: "C - Cấm", description: "Phim bị cấm chiếu", minAge: 99, status: "inactive", movies: 2 }
    ]
  };

  const tabs = [
    {
      id: "countries",
      label: "Quốc gia",
      icon: <Flag className="w-4 h-4" />,
      description: "Quản lý danh sách quốc gia sản xuất phim"
    },
    {
      id: "formats",
      label: "Định dạng",
      icon: <Video className="w-4 h-4" />,
      description: "Quản lý định dạng chiếu (2D, 3D, IMAX...)"
    },
    {
      id: "genres",
      label: "Thể loại",
      icon: <Tags className="w-4 h-4" />,
      description: "Quản lý thể loại phim (Hành động, Tình cảm...)"
    },
    {
      id: "languages",
      label: "Ngôn ngữ",
      icon: <Languages className="w-4 h-4" />,
      description: "Quản lý ngôn ngữ phim"
    },
    {
      id: "limitages",
      label: "Giới hạn tuổi",
      icon: <Users className="w-4 h-4" />,
      description: "Quản lý phân loại độ tuổi (T13, T16, T18...)"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "countries":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Quốc gia</h3>
                <p className="text-slate-600">Danh sách các quốc gia sản xuất phim</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm quốc gia
              </button>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Quốc gia</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Mã code</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Số phim</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.countries.map((country) => (
                    <tr key={country.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{country.name}</td>
                      <td className="py-3 px-4 text-slate-600">{country.code}</td>
                      <td className="py-3 px-4 text-slate-600">{country.movies}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          country.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {country.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "formats":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Định dạng</h3>
                <p className="text-slate-600">Danh sách các định dạng chiếu phim</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm định dạng
              </button>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Định dạng</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Mô tả</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Số rạp</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {formats.map((format) => (
                    <tr key={format.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{format.nameVn}</td>
                      {/* <td className="py-3 px-4 text-slate-600">{format.description}</td>
                      <td className="py-3 px-4 text-slate-600">{format.theaters}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          format.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {format.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td> */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "genres":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Thể loại</h3>
                <p className="text-slate-600">Danh sách các thể loại phim</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm thể loại
              </button>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thể loại</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Mô tả</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Số phim</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.genres.map((genre) => (
                    <tr key={genre.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{genre.name}</td>
                      <td className="py-3 px-4 text-slate-600">{genre.description}</td>
                      <td className="py-3 px-4 text-slate-600">{genre.movies}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          genre.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {genre.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "languages":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Ngôn ngữ</h3>
                <p className="text-slate-600">Danh sách các ngôn ngữ phim</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm ngôn ngữ
              </button>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Ngôn ngữ</th>
                    {/* <th className="text-left py-3 px-4 font-medium text-slate-700">Mã code</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Số phim</th> */}
                    {/* <th className="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th> */}
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((language) => (
                    <tr key={language.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{language.nameVn}</td>
                      {/* <td className="py-3 px-4 text-slate-600">{language.code}</td>
                      <td className="py-3 px-4 text-slate-600">{language.movies}</td> */}
                      {/* <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          language.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {language.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td> */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "limitages":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Giới hạn tuổi</h3>
                <p className="text-slate-600">Danh sách các phân loại độ tuổi</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm phân loại
              </button>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Phân loại</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Mô tả</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tuổi tối thiểu</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Số phim</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.limitages.map((limitage) => (
                    <tr key={limitage.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{limitage.name}</td>
                      <td className="py-3 px-4 text-slate-600">{limitage.description}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {limitage.minAge === 99 ? "Cấm" : `${limitage.minAge}+`}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{limitage.movies}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          limitage.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {limitage.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Hệ thống & Cấu hình</h1>
            <p className="text-slate-600">Quản lý cấu hình hệ thống và dữ liệu reference</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <nav className="flex overflow-x-auto *:w-full *:justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Main Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        {tabs.map((tab) => {
          let itemCount = 0;
          let activeCount = 0;
          
          switch (tab.id) {
            case "countries":
              itemCount = mockData.countries.length;
              activeCount = mockData.countries.filter(item => item.status === "active").length;
              break;
            case "formats":
              itemCount = formats.length;
            //   activeCount = mockData.formats.filter(item => item.status === "active").length;
              break;
            case "genres":
              itemCount = mockData.genres.length;
              activeCount = mockData.genres.filter(item => item.status === "active").length;
              break;
            case "languages":
              itemCount = languages.length;
            //   activeCount = languages.filter(item => item.status === "active").length;
              break;
            case "limitages":
              itemCount = mockData.limitages.length;
              activeCount = mockData.limitages.filter(item => item.status === "active").length;
              break;
          }
          
          return (
            <div
              key={tab.id}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? "bg-blue-100" : "bg-slate-100"}`}>
                  {tab.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{tab.label}</p>
                  <p className="text-xs text-slate-500">
                    {itemCount} items • {activeCount} hoạt động
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
};

export default SystemManagement;
