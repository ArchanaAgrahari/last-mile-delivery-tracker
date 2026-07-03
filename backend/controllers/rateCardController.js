import RateCard from "../models/RateCard.js";

export const createRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.create(req.body);
    res.status(201).json(rateCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRateCards = async (req, res) => {
  const rateCards = await RateCard.find();
  res.json(rateCards);
};

export const updateRateCard = async (req, res) => {
  const rateCard = await RateCard.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(rateCard);
};