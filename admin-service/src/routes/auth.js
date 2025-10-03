import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/index.js";
import fs from "fs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

// helper
function token(u){
  return jwt.sign({sub:u.id,email:u.email,role:u.role},JWT_SECRET,{expiresIn:"12h"});
}

// migrate on startup
(async()=>{
  const sql = fs.readFileSync("src/db/sql/001_init.sql").toString();
  await pool.query(sql);
})();

// register
router.post("/register", async (req,res)=>{
  try{
    const {email,password,role="user"} = req.body||{};
    if(!email||!password) return res.status(400).json({error:"Missing fields"});
    const hash = await bcrypt.hash(password,10);
    const q = await pool.query(
      `INSERT INTO users(email,password_hash,role,is_verified)
       VALUES($1,$2,$3,true)
       ON CONFLICT(email) DO NOTHING RETURNING id,email,role`,
       [email,hash,role]
    );
    if(!q.rows.length) return res.status(409).json({error:"Email exists"});
    const u = q.rows[0];
    res.json({ok:true, token:token(u), user:u});
  }catch(e){ console.error("❌ Register:",e); res.status(500).json({error:"Register failed",detail:e.message}); }
});

// login
router.post("/login", async (req,res)=>{
  try{
    const {email,password} = req.body||{};
    const q = await pool.query(`SELECT * FROM users WHERE email=$1`,[email]);
    if(!q.rows.length) return res.status(401).json({error:"Invalid"});
    const u=q.rows[0];
    const ok = await bcrypt.compare(password,u.password_hash);
    if(!ok) return res.status(401).json({error:"Invalid"});
    res.json({ok:true, token:token(u), role:u.role});
  }catch(e){ console.error("❌ Login:",e); res.status(500).json({error:"Login failed",detail:e.message}); }
});

// profile
router.get("/me", async (req,res)=>{
  try{
    const h=req.headers.authorization;
    if(!h) return res.status(401).json({error:"No token"});
    const d=jwt.verify(h.replace("Bearer ",""),JWT_SECRET);
    res.json({ok:true,user:d});
  }catch(e){ res.status(401).json({error:"Invalid token",detail:e.message}); }
});

export default router;

