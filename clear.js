fetch("http://localhost:3000/api/admin/clear_all", { method: "POST" })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
