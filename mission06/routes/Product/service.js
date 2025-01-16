import Product from "../../models/Product.js";

export const getProductList = async (req, res) => {
  try {
    const productList = await Product.find({});

    if (!productList) {
      res.status(404).send("상품 목록이 존재하지 않습니다!");
    }

    res.status(200).send(productList);
  } catch (error) {
    console.error("상품 목록 조회 중 오류 발생:", error.message);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const getProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).send("상품의 id가 존재하지 않습니다.");
    }

    const product = Product.findById(id);
    if (!product) {
      return res.status(404).send("상품이 존재하지 않습니다.");
    }

    res.status(200).send(product);
  } catch (error) {
    console.error("상품 조회 중 오류 발생:", error.message);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
