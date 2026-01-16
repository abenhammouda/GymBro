using System;

// Script pour générer un hash BCrypt pour le mot de passe de test
// Mot de passe: Test123!
// Exécuter avec: dotnet script GeneratePasswordHash.cs

var password = "Test123!";
var hash = BCrypt.Net.BCrypt.HashPassword(password);

Console.WriteLine($"Mot de passe: {password}");
Console.WriteLine($"Hash BCrypt: {hash}");
Console.WriteLine();
Console.WriteLine("Utilisez ce hash dans le script SQL SeedTestAccounts.sql");
