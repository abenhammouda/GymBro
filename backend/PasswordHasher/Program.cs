using System;

var password = "Test123!";
var hash = BCrypt.Net.BCrypt.HashPassword(password);

Console.WriteLine($"Mot de passe: {password}");
Console.WriteLine($"Hash BCrypt: {hash}");
