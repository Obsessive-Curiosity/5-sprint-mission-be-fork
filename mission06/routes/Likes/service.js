import Likes from "../../models/Likes.js";

export const addLikes = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    if (!productId || !userId) {
      return res.send({ message: "누락된 데이타가 있습니다." });
    }

    const exLikes = await Likes.findOne({ productId, userId });
    if (exLikes) {
      return res.status(400).send({ message: "이미 좋아요를 눌렀습니다." });
    }

    // 좋아요 추가
    const newLike = await Likes.create({ userId, productId });

    res.status(201).send(newLike);
  } catch (error) {
    console.error("좋아요 등록 중 오류 발생:", error.message);
    res.status(500).send({ message: "서버 오류가 발생했습니다." });
  }
};

export const deleteLikes = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    if (!productId || !userId) {
      return res.send({ message: "누락된 데이타가 있습니다." });
    }

    const exLikes = Likes.findOne({ productId, userId });
    if (!exLikes) {
      return res.status(404).send({ message: "좋아요가 존재하지 않습니다." });
    }

    // 좋아요 삭제
    await Likes.deleteOne({ userId, productId });

    res.status(200).send({ message: "좋아요가 취소되었습니다." });
  } catch (error) {
    console.error("좋아요 등록 중 오류 발생:", error.message);
    res.status(500).send({ message: "서버 오류가 발생했습니다." });
  }
};
