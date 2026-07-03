import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { dbPromise } from "./db";

type Product = {
  barcode: string;
  name: string;
  price: number;
};

function App() {
  const [cart, setCart] = useState<Product[]>([]);
  const [scannerOn, setScannerOn] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const [products, setProducts] = useState<any[]>([]);

  const [newBarcode, setNewBarcode] = useState("");
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // 🔄 LOAD INVENTORY
  const loadInventory = async () => {
    const db = await dbPromise;

    const prods = await db.getAll("products");
    const inv = await db.getAll("inventory");

    const merged = prods.map((p: any) => {
      const item = inv.find((i: any) => i.barcode === p.barcode);
      return {
        ...p,
        stock: item ? item.stock : 0,
      };
    });

    setProducts(merged);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // ➕ ADD PRODUCT
  const addProduct = async () => {
    const db = await dbPromise;

    await db.put("products", {
      barcode: newBarcode.trim(),
      name: newName,
      price: Number(newPrice),
    });

    await db.put("inventory", {
      barcode: newBarcode.trim(),
      stock: Number(newStock),
    });

    alert("Product added ✅");

    setNewBarcode("");
    setNewName("");
    setNewStock("");
    setNewPrice("");

    loadInventory();
  };

  // ✏️ UPDATE PRODUCT
  const updateProduct = async (item: any) => {
    const db = await dbPromise;

    await db.put("products", {
      barcode: item.barcode,
      name: item.name,
      price: Number(item.price),
    });

    await db.put("inventory", {
      barcode: item.barcode,
      stock: Number(item.stock),
    });

    alert("Updated ✅");
    loadInventory();
  };

  // ❌ DELETE PRODUCT
  const deleteProduct = async (barcode: string) => {
    const db = await dbPromise;

    await db.delete("products", barcode);
    await db.delete("inventory", barcode);

    alert("Deleted ❌");
    loadInventory();
  };

  // 📷 SCANNER
  const startScanner = () => {
    setScannerOn(true);
    const scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      { fps: 10 },
      async (decodedText) => {
        await handleScan(decodedText);
        await scanner.stop();
        setScannerOn(false);
      }
    );
  };

  // 🧠 HANDLE SCAN
  const handleScan = async (barcode: string) => {
    const db = await dbPromise;

    const clean = barcode.trim();
    const product = await db.get("products", clean);

    if (!product) {
      alert("Product not found ❌");
      return;
    }

    setCart((prev) => [...prev, product]);

    const inv = await db.get("inventory", clean);
    if (inv) {
      inv.stock -= 1;
      await db.put("inventory", inv);
    }
  };

  // 💸 CHECKOUT
  const checkout = async () => {
    const db = await dbPromise;

    for (let item of cart) {
      await db.add("sales", {
        barcode: item.barcode,
        time: Date.now(),
      });
    }

    const receipt = cart
      .map((item) => `${item.name} - ₹${item.price}`)
      .join("\n");

    const total = cart.reduce((s, i) => s + i.price, 0);

    alert(`🧾 RECEIPT\n\n${receipt}\n\nTotal: ₹${total}`);

    setCart([]);
    loadInventory();
    await checkAlerts();
  };

  // 🚨 SMART ALERTS (FIXED)
  const checkAlerts = async () => {
    const db = await dbPromise;

    const inventory = await db.getAll("inventory");
    const sales = await db.getAll("sales");

    const newAlerts: string[] = [];
    const now = Date.now();

    for (let item of inventory) {
      const product = await db.get("products", item.barcode);

      const last3 = sales.filter(
        (s: any) =>
          s.barcode === item.barcode &&
          now - s.time <= 3 * 24 * 60 * 60 * 1000
      );

      // 🔥 FIXED DEMAND CALCULATION
      let dailyRate = last3.length / 3;

      if (dailyRate === 0) {
        dailyRate = 1; // fallback demand
      }

      const daysLeft = item.stock / dailyRate;

      let reorder = 0;

      if (daysLeft < 5) {
        reorder = Math.ceil(dailyRate * 7); // next 7 days stock
      }

      newAlerts.push(
        `${product.name} | Stock: ${item.stock} | Ends in: ${daysLeft.toFixed(
          1
        )} days | Reorder: ${reorder}`
      );
    }

    setAlerts(newAlerts);
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h1>🧾 Smart Billing AI</h1>
      <h1>🧾 Smart Billing</h1>

<button onClick={async () => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello Gemini" }] }],
      }),
    }
  );

  const data = await res.json();
  console.log("AI RESPONSE:", data);
}}>
Test AI
</button>

      {/* ADD PRODUCT */}
      <h3>Add Product</h3>
      <input
        placeholder="Barcode"
        value={newBarcode}
        onChange={(e) => setNewBarcode(e.target.value)}
      />
      <input
        placeholder="Name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <input
        placeholder="Stock"
        type="number"
        value={newStock}
        onChange={(e) => setNewStock(e.target.value)}
      />
      <input
        placeholder="Price"
        type="number"
        value={newPrice}
        onChange={(e) => setNewPrice(e.target.value)}
      />
      <button onClick={addProduct}>Add</button>

      <hr />

      {/* NAV */}
      <button onClick={() => setShowInventory(!showInventory)}>
        📦 Inventory
      </button>
      <button onClick={() => setShowAlerts(!showAlerts)}>
        📊 Alerts
      </button>

      {/* INVENTORY */}
      {showInventory && (
        <div>
          <h3>📦 Inventory</h3>

          {products.map((p, i) => (
            <div key={i} style={{ border: "1px solid gray", margin: 5 }}>
              <input
                value={p.name}
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((item, idx) =>
                      idx === i ? { ...item, name: e.target.value } : item
                    )
                  )
                }
              />
              <input
                type="number"
                value={p.price}
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((item, idx) =>
                      idx === i ? { ...item, price: e.target.value } : item
                    )
                  )
                }
              />
              <input
                type="number"
                value={p.stock}
                onChange={(e) =>
                  setProducts((prev) =>
                    prev.map((item, idx) =>
                      idx === i ? { ...item, stock: e.target.value } : item
                    )
                  )
                }
              />

              <button onClick={() => updateProduct(p)}>Save</button>
              <button onClick={() => deleteProduct(p.barcode)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BILLING */}
      {!showInventory && !showAlerts && (
        <>
          <button onClick={startScanner}>📷 Scan</button>
          {scannerOn && <div id="reader" />}

          <h2>Cart</h2>

          {cart.map((item, i) => (
            <div key={i}>
              {item.name} - ₹{item.price}
            </div>
          ))}

          <h3>Total ₹{cart.reduce((s, i) => s + i.price, 0)}</h3>

          <button onClick={checkout}>Pay</button>
        </>
      )}

      {/* ALERTS */}
      {showAlerts && (
        <div>
          <h3>📊 Smart Alerts</h3>
          {alerts.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;