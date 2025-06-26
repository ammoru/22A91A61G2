// fetch('http://20.244.56.144/evaluation-service/register', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify({
//     "email": "22a91a61g2@aec.edu.in",
//     "name": "Kunchapu Ammoru",
//     "mobileNo": "6305369674",
//     "githubUsername": "ammoru",
//     "rollNo": "22A91A61g2",
//     "accessCode": "NFwgRT"
// })
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch(error => console.error('Error:', error));

// fetch('http://20.244.56.144/evaluation-service/auth', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify({
//   "email": "22a91a61g2@aec.edu.in",
//   "name": "kunchapu ammoru",
//   "rollNo": "22a91a61g2",
//   "accessCode": "NFwgRT",
//   "clientID": "c03eedf1-1ea1-4108-82f0-4a99f2817f6f",
//   "clientSecret": "PFUYjhaHvHccBDBT"
// })
// })
// .then(response => response.json())
// .then(data => console.log(data))
// .catch(error => console.error('Error:', error));


const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMmE5MWE2MWcyQGFlYy5lZHUuaW4iLCJleHAiOjE3NTA5Mjc0MzUsImlhdCI6MTc1MDkyNjUzNSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImMyYThmM2NkLWU5ZTAtNDM1MS1iNGYyLTAyMDQzMjc2MDY1YiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Imt1bmNoYXB1IGFtbW9ydSIsInN1YiI6ImMwM2VlZGYxLTFlYTEtNDEwOC04MmYwLTRhOTlmMjgxN2Y2ZiJ9LCJlbWFpbCI6IjIyYTkxYTYxZzJAYWVjLmVkdS5pbiIsIm5hbWUiOiJrdW5jaGFwdSBhbW1vcnUiLCJyb2xsTm8iOiIyMmE5MWE2MWcyIiwiYWNjZXNzQ29kZSI6Ik5Gd2dSVCIsImNsaWVudElEIjoiYzAzZWVkZjEtMWVhMS00MTA4LTgyZjAtNGE5OWYyODE3ZjZmIiwiY2xpZW50U2VjcmV0IjoiUEZVWWpoYUh2SGNjQkRCVCJ9.Z0SqtetGFujEW8K57cHtEkFhsYXfDgcdh7Bk_Jqzv6E"
  fetch('http://20.244.56.144/evaluation-service/logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    "Authorization":`Bearer ${token}`
  },
  body: JSON.stringify({
    
  stack:"backend",
  level:"error",
  package:"handler",
  message:"received string,expected bool"
  })
})
  .then(response => response.json())
  .then(data => console.log('Auth Response:', data))
  .catch(error => console.error('Auth Error:', error));