import { useEffect, useState } from "react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!product.productBarcode || !product.name) {
      alert("产品条码和名称不能为空");
      return;
    }
    try {
      const url = product._id ? `${API_BASE}/${product._id}` : API_BASE;
      const method = product._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        alert(product._id ? "更新成功" : "保存成功");
        setProduct({ _id: null, boxBarcode: "", productBarcode: "", name: "", spec: "", stock: 0 });
        fetchProducts();
        setView("list");
      } else {
        alert("保存失败");
      }
    } catch (err) {
      alert("网络错误");
    }
  };

  const handleEdit = (item) => {
    setProduct(item);
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
              setProduct({ _id: null, boxBarcode: "", productBarcode: "", name: "", spec: "", stock: 0 });
              setView("add");
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
                  <th className="p-2">产品条码</th>
                  <th className="p-2">名称</th>
                  <th className="p-2">规格</th>
                  <th className="p-2">库存数</th>
                  <th className="p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item, index) => (
                  <tr key={item._id} className="border-t">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{item.productBarcode}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.spec}</td>
                    <td className="p-2">{item.stock}</td>
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
          <h2 className="text-xl font-semibold mb-4">{product._id ? "编辑产品" : "产品入库"}</h2>
          <div className="space-y-4">
            <input
              name="boxBarcode"
              placeholder="箱子条码（可选）"
              value={product.boxBarcode}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <input
              name="productBarcode"
              placeholder="产品条码（必填）"
              value={product.productBarcode}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <input
              name="name"
              placeholder="产品名称"
              value={product.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <input
              name="spec"
              placeholder="规格（如 500g*12）"
              value={product.spec}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <input
              name="stock"
              type="number"
              placeholder="库存数量"
              value={product.stock}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >{product._id ? "更新" : "保存"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
