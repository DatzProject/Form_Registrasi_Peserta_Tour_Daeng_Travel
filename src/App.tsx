import React, { useState, useEffect, useRef } from "react";
import { Plus, Save, User, Calendar, Image } from "lucide-react";

// Definisikan tipe data
type FormData = {
  nama: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  nomor_passport: string;
};

interface TravelData extends FormData {
  id: string;
  foto_passport?: string;
}

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzLrbL8YkJ2GuJ0jKIr12OhWohydZy3obz22IKtOP4GFM8OnIgq41oVmPUlfEy1aMeSGA/exec";

const TravelFormApp = () => {
  const [formData, setFormData] = useState<FormData>({
    nama: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    nomor_passport: "",
  });

  const [fotoPassportBase64, setFotoPassportBase64] = useState<string | null>(
    null
  );
  const [dataList, setDataList] = useState<TravelData[]>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem("travelDataList");
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ useRef ditempatkan di dalam komponen — sesuai Rules of Hooks
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sinkronisasi ke localStorage setiap kali dataList berubah
  useEffect(() => {
    localStorage.setItem("travelDataList", JSON.stringify(dataList));
  }, [dataList]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFotoPassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setFotoPassportBase64(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    return (
      formData.nama &&
      formData.tanggal_lahir &&
      formData.jenis_kelamin &&
      formData.nomor_passport
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setMessage("Harap isi semua field yang diperlukan");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const uniqueId = `${formData.nama}_${formData.tanggal_lahir}`;

      const dataToSend = {
        ...formData,
        id: uniqueId,
        foto_passport: fotoPassportBase64
          ? fotoPassportBase64.split(",")[1]
          : null,
        sheet: "FormCostumer",
      };

      const response = await fetch(ENDPOINT, {
        method: "POST",
        body: JSON.stringify(dataToSend),
        headers: {
          "Content-Type": "text/plain",
        },
        mode: "cors",
        redirect: "follow",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menyimpan: ${errorText}`);
      }

      const newData = await response.json();

      setDataList((prev) => [
        ...prev,
        {
          id: uniqueId,
          ...formData,
          foto_passport: newData.foto_passport || "",
        },
      ]);

      // Reset form
      setFormData({
        nama: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        nomor_passport: "",
      });
      setFotoPassportBase64(null);

      // ✅ Reset input file di DOM
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Data berhasil disimpan!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data";
      setMessage(errorMessage);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
          <div className="mb-4">
            <img
              src="/logo_daeng_travel.png"
              alt="Logo Aplikasi"
              className="mx-auto h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Form Data Customer
          </h1>
          <p className="text-gray-600">Masukkan data customer dengan mudah</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes("berhasil")
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Input */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Plus className="mr-2" size={24} />
              Tambah Data Baru
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <User size={16} className="mr-1" />
                  Nama
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Passport
                </label>
                <input
                  type="text"
                  name="nomor_passport"
                  value={formData.nomor_passport}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nomor passport"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Image size={16} className="mr-1" />
                  Foto Passport
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoPassportChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ref={fileInputRef}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Save className="mr-2" size={20} />
                {isLoading ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>

          {/* Data List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Data Tersimpan ({dataList.length})
            </h2>
            {dataList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User size={48} className="mx-auto mb-4 opacity-50" />
                <p>Belum ada data tersimpan</p>
                <p className="text-sm mt-2">
                  Silakan isi form untuk menambah data
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dataList.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* ❌ TOMBOL HAPUS SUDAH DIHILANGKAN — hanya tampilkan nama */}
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {item.nama}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Tanggal Lahir:</span>{" "}
                        {item.tanggal_lahir}
                      </div>
                      <div>
                        <span className="font-medium">Jenis Kelamin:</span>{" "}
                        {item.jenis_kelamin}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Nomor Passport:</span>{" "}
                        {item.nomor_passport || "Tidak ada"}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Foto Passport:</span>{" "}
                        {item.foto_passport ? (
                          <a
                            href={item.foto_passport}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Lihat Foto
                          </a>
                        ) : (
                          "Tidak ada"
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return <TravelFormApp />;
};

export default App;
