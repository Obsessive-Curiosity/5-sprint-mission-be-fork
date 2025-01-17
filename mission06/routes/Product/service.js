import Product from "../../models/Product.js";
import Tag from "../../models/Tag.js";
import Likes from "../../models/Likes.js";
import _ from "lodash";

// tags, likes 들 모두 가져와야 함 ㅇㅇ
export const getProductList = async (req, res) => {
  try {
    const { page, pageSize, orderBy, keyword, userId } = req.query;

    if (!page || !pageSize || !orderBy) {
      return res.status(400).send({ message: "누락된 쿼리가 있습니다." });
    }

    // 필터 조건 생성
    const filterCondition = keyword
      ? { name: new RegExp(keyword, "i") } // 이름 필드에서 keyword 포함 여부 검사 (대소문자 구분 없음)
      : {};

    // 전체 목록 및 카운트 가져오기
    const totalList = await Product.find(filterCondition);
    const totalCount = totalList.length;

    const orderByCondition =
      orderBy === "recent" ? { createdAt: -1 } : { favoriteCount: -1 };

    // 페이지네이션 적용된 상품 목록 가져오기
    const productList = await Product.find(filterCondition)
      .sort(orderByCondition)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (!productList) {
      res.status(404).send("상품 목록이 존재하지 않습니다!");
    }

    // product에 favoriteCount, isLikes 속성 추가하기
    for (const product of productList) {
      const totalLikes = (await Likes.find({ productId: product._id })) || [];
      const userLikes = await Likes.findOne({ productId: product._id, userId });
      const isLikes = userLikes ? true : false; // user가 좋아요 누른 상품인 경우 true

      product.favoriteCount = totalLikes.length;
      product.isLikes = isLikes;
    }

    // 마지막에 정렬하기

    res.status(200).send({ productList, totalCount });
  } catch (error) {
    console.error("상품 목록 조회 중 오류 발생:", error.message);
    res.status(500).send({ message: "서버 오류가 발생했습니다." });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params; // 경로 매개변수에서 id 가져오기
    const { userId } = req.query; // 쿼리 매개변수에서 userId 가져오기

    if (!id) {
      return res.status(404).send("상품의 id가 존재하지 않습니다.");
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send("상품이 존재하지 않습니다.");
    }

    // tags 가져오기
    const tags = (await Tag.find({ productId: id })) || [];
    const tagNames = tags.map((tag) => tag.name);

    // favoriteCount 가져오기
    const totalLikes = (await Likes.find({ productId: id })) || [];
    const userLikes = (await Likes.findOne({ productId: id, userId })) || [];
    const isLikes = userLikes ? true : false; // user가 좋아요 누른 상품인 경우 true

    // product 속성에 추가
    product.favoriteCount = totalLikes.length; // 좋아요 수 추가

    res.status(200).send({ product, tagNames, isLikes });
  } catch (error) {
    console.error("상품 조회 중 오류 발생:", error.message);
    res.status(500).send({ message: "서버 오류가 발생했습니다." });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { tags, ...props } = req.body;
    const newTags = [];

    const newProduct = await Product.create(props);

    // tags가 없는 경우
    if (!tags || tags.length < 1) {
      return res.status(201).send(newProduct);
    }

    // tags가 있는 경우
    for (const tag of tags) {
      const newTag = await Tag.create({
        productId: newProduct._id,
        name: tag,
      });

      newTags.push(newTag);
    }

    res.status(201).send({
      newProduct,
      newTags,
      message: "상품과 태그가 성공적으로 생성되었습니다.",
    });
  } catch (error) {
    console.error("상품 추가 중 오류 발생:", error.message);
    res.status(500).send({ message: "서버 오류가 발생했습니다." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { tags, ...props } = req.body; // tags 새로 업데이트 될 tags

    const id = req.params.id; // 상품 id
    if (!id) {
      return res
        .status(404)
        .send({ message: "상품의 id가 존재하지 않습니다." });
    }

    const product = await Product.findById(id); // id의 상품
    if (!product) {
      return res
        .status(404)
        .send({ message: "해당 상품이 존재하지 않습니다." });
    }

    // 제품 변경사항 반영
    Object.keys(props).map((key) => {
      product[key] = props[key];
    });
    await product.save();

    // 태그 없는 경우
    if (!tags || tags.length < 1) {
      await Tag.deleteMany({ productId: id }); // 기존 태그 모두 삭제
      return res.status(203).send(product);
    }

    // 태그 있는 경우
    // 기존 태그 찾고 그 중 없는 태그 삭제
    const prevTags = await Tag.find({ productId: id });
    const prevTagNames = prevTags.map((tag) => tag.name);
    const deleteTagNames = _.difference(prevTagNames, tags);
    await Tag.deleteMany({ productId: id, name: { $in: deleteTagNames } });

    // 새로운 태그는 등록
    for (const tag of tags) {
      const exTag = await Tag.findOne({ name: tag });

      // 없으면 newTag 생성
      if (!exTag) {
        await Tag.create({
          productId: id,
          name: tag,
        });
      }
    }
    await product.save();

    res.status(203).send(product);
  } catch (error) {
    console.error("상품 수정 중 오류 발생:", error.message);
    res.status(500).send({ message: "서버 오류가 발생했습니다." });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id; // 상품 id
    if (!id) {
      return res
        .status(404)
        .send({ message: "상품의 id가 존재하지 않습니다." });
    }
    const product = await Product.findById(id); // id의 상품
    if (!product) {
      return res
        .status(404)
        .send({ message: "해당 상품이 존재하지 않습니다." });
    }
    // 상품 삭제
    await Product.findByIdAndDelete(id);

    // 태그 삭제
    const tags = await Tag.find({ productId: id });

    // 태그가 존재하면 삭제
    if (tags.length > 0) {
      await Tag.deleteMany({ productId: id }); // 해당 상품의 모든 태그 삭제
    }

    res.send({ message: "상품을 삭제했습니다." });
  } catch (error) {
    console.error("상품 삭제 중 오류 발생:", error.message);
    res.status(500).send({ message: "서버 오류가 발생했습니다." });
  }
};
