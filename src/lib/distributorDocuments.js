import Counter from "@/models/Counter";

export async function getNextDistributorDocumentNumber({ companyId, counterId, prefix, pad = 5 }) {
  const counter = await Counter.findOneAndUpdate(
    { companyId, id: counterId },
    {
      $inc: { seq: 1 },
      $setOnInsert: { companyId, id: counterId },
    },
    { new: true, upsert: true }
  );

  return `${prefix}-${String(counter.seq).padStart(pad, "0")}`;
}
