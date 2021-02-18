/**
 * Spin up express server to preview dist can be in a different folder really
 * and probably should be
 */
const express = require("express")
const path = require("path")
const app = new express()
app.use(express.static(path.join(__dirname, "dist")))
app.get("*", (req, res) => res.sendFile(__dirname + "/dist/index.html"))
app.listen("4444")