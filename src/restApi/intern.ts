// src/controller/InternshipController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../db.config";
import { Internship } from "../entity/Internship";
import { User } from "../entity/User";
import { Repository } from "typeorm";

const internshipRepository: Repository<Internship> = AppDataSource.getRepository(Internship);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

export const createInternship = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const { joinedDate, completionDate, isCertified, mentorName } = req.body;

  try {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newInternship = internshipRepository.create({
      joinedDate,
      completionDate,
      isCertified,
      mentorName,
      user,
    });

    await internshipRepository.save(newInternship);

    return res.status(201).json(newInternship);
  } catch (error) {
    console.error("Error creating internship:", error);
    return res.status(500).json({ message: "Failed to create internship." });
  }
};
