// App.js
import { useEffect, useState, useRef } from "react";

const API_BASE = "https://wms-backend-hdu8.onrender.com/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [product, setProduct] = useState({
    _id: null,
    boxBarcode: "",
    productBarcode: "",
    name: "",
    spec: "",
    stock: 0,
  });
  const [quantity, setQuantity] = useState(0);
  const [isEditable, setIsEditable] = useState(false);
  const barcodeRef = useRef();

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      alert("无法获取产品列表");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetProduct = () => {
    setProduct({ _id: null, boxBarcode: "", productBarcode: "", name: "", spec: "", stock: 0 });
    setQuantity(0);
    setIsEditable(false);
  };

  const handleBarcodeEnter = (e) => {
    if (e.key === "Enter") {
      const value = e.target.value.trim();
      if (!value) return;
      const found = products.find(
        (item) => item.productBarcode === value || item.boxBarcode === value
      );
      if (found) {
        setProduct(found);
        setQuantity(0);
        setIsEditable(false);
      } else {
        if (window.confirm("未找到该条码的产品，是否创建新产品？")) {
          resetProduct();
          setProduct((prev) => ({ ...prev, productBarcode: value }));
          setIsEditable(true);
          setView("add");
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "stock") {
      setQuantity(Number(value));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!product.productBarcode.trim()) {
      alert("产品条码不能为空");
      return;
    }
    if (!product.name.trim()) {
      alert("产品名称不能为空");
      return;
    }
    if (quantity <= 0) {
      alert("入库数量必须大于 0");
      return;
    }
    const duplicate = products.find(p => p.productBarcode === product.productBarcode && p._id !== product._id);
    if (duplicate) {
      alert("产品条码已存在，必须唯一");
      return;
    }

    try {
      const existing = products.find(p => p.productBarcode === product.productBarcode);
      let method = "POST", url = API_BASE;
      let newData = { ...product };
      if (existing) {
        method = "PUT";
        url = `${API_BASE}/${existing._id}`;
        newData = { ...existing, stock: existing.stock + quantity };
      } else {
        newData.stock = quantity;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (res.ok) {
        alert(existing ? `已更新库存，当前库存：${newData.stock}` : "保存成功");
        resetProduct();
        fetchProducts();
        setView("list");
        setTimeout(() => barcodeRef.current?.focus(), 100);
      } else {
        alert("保存失败");
      }
    } catch (err) {
      alert("网络错误");
    }
  };

  const handleEditFields = () => {
    setIsEditable(true);
  };

  const handleEdit = (item) => {
    setProduct(item);
    setQuantity(0);
    setIsEditable(false);
    setView("add");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除该商品吗？")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("删除成功");
        fetchProducts();
      } else {
        alert("删除失败");
      }
    } catch (err) {
      alert("网络错误");
    }
  };

  const filteredProducts = products.filter(
    (item) =>
      item.productBarcode.includes(searchTerm) ||
      item.name.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">仓库库存系统</h1>
        <div>
          <button
            onClick={() => setView("list")}
            className="bg-gray-300 text-black px-3 py-1 rounded mr-2"
          >库存列表</button>
          <button
            onClick={() => {
              resetProduct();
              setView("add");
              setTimeout(() => barcodeRef.current?.focus(), 100);
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >入库</button>
        </div>
      </div>

      {view === "list" && (
        <div>
          <input
            type="text"
            placeholder="搜索条码或名称"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full max-w-sm"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden shadow">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">序号</th>
                  <th className="p-2">箱子条码</th>
                  <th className="p-2">产品条码</th>
                  <th className="p-2">名称</th>
                  <th className="p-2">规格</th>
                  <th className="p-2">实时库存数</th>
                  <th className="p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item, index) => (
                  <tr key={item._id} className="border-t">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{item.boxBarcode}</td>
                    <td className="p-2">{item.productBarcode}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.spec}</td>
                    <td className="p-2 text-red-600 font-bold text-lg">{item.stock}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:underline"
                      >编辑</button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:underline"
                      >删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "add" && (
        <div className="bg-white p-4 rounded-xl shadow max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">{product._id ? "入库现有产品" : "创建新产品"}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">产品条码</label>
              <input
                ref={barcodeRef}
                name="productBarcode"
                value={product.productBarcode}
                onChange={handleChange}
                onKeyDown={handleBarcodeEnter}
                className="w-full border border-gray-300 p-2 rounded"
                readOnly={!!product._id && !isEditable}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">箱子条码</label>
              <input
                name="boxBarcode"
                value={product.boxBarcode}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                readOnly={!!product._id && !isEditable}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">产品名称</label>
              <input
                name="name"
                value={product.name}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                readOnly={!!product._id && !isEditable}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">规格</label>
              <input
                name="spec"
                value={product.spec}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                readOnly={!!product._id && !isEditable}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">新增数量</label>
              <input
                name="stock"
                type="number"
                value={quantity}
                onChange={handleChange}
                className="w-full border border-blue-500 p-2 rounded"
              />
            </div>
            {!!product._id && !isEditable && (
              <button
                onClick={handleEditFields}
                className="w-full bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500"
              >编辑产品信息</button>
            )}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >保存</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
