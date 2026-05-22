using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNutritionAndMacros : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Calories",
                table: "MealIngredients",
                type: "decimal(8,2)",
                precision: 8,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Carbs",
                table: "MealIngredients",
                type: "decimal(8,2)",
                precision: 8,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Fats",
                table: "MealIngredients",
                type: "decimal(8,2)",
                precision: 8,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "MacroCalculationFailed",
                table: "MealIngredients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MacroSource",
                table: "MealIngredients",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NutritionFoodId",
                table: "MealIngredients",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Proteins",
                table: "MealIngredients",
                type: "decimal(8,2)",
                precision: 8,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "NutritionFoods",
                columns: table => new
                {
                    NutritionFoodId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CanonicalName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CanonicalNameFr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CaloriesPer100g = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    ProteinsPer100g = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    CarbsPer100g = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    FatsPer100g = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false),
                    Source = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionFoods", x => x.NutritionFoodId);
                });

            migrationBuilder.CreateTable(
                name: "FoodAliasCaches",
                columns: table => new
                {
                    FoodAliasCacheId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NormalizedInput = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NutritionFoodId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodAliasCaches", x => x.FoodAliasCacheId);
                    table.ForeignKey(
                        name: "FK_FoodAliasCaches_NutritionFoods_NutritionFoodId",
                        column: x => x.NutritionFoodId,
                        principalTable: "NutritionFoods",
                        principalColumn: "NutritionFoodId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MealIngredients_NutritionFoodId",
                table: "MealIngredients",
                column: "NutritionFoodId");

            migrationBuilder.CreateIndex(
                name: "IX_FoodAliasCaches_NormalizedInput",
                table: "FoodAliasCaches",
                column: "NormalizedInput",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FoodAliasCaches_NutritionFoodId",
                table: "FoodAliasCaches",
                column: "NutritionFoodId");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionFoods_CanonicalName",
                table: "NutritionFoods",
                column: "CanonicalName");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionFoods_CanonicalNameFr",
                table: "NutritionFoods",
                column: "CanonicalNameFr");

            migrationBuilder.AddForeignKey(
                name: "FK_MealIngredients_NutritionFoods_NutritionFoodId",
                table: "MealIngredients",
                column: "NutritionFoodId",
                principalTable: "NutritionFoods",
                principalColumn: "NutritionFoodId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MealIngredients_NutritionFoods_NutritionFoodId",
                table: "MealIngredients");

            migrationBuilder.DropTable(
                name: "FoodAliasCaches");

            migrationBuilder.DropTable(
                name: "NutritionFoods");

            migrationBuilder.DropIndex(
                name: "IX_MealIngredients_NutritionFoodId",
                table: "MealIngredients");

            migrationBuilder.DropColumn(
                name: "Calories",
                table: "MealIngredients");

            migrationBuilder.DropColumn(
                name: "Carbs",
                table: "MealIngredients");

            migrationBuilder.DropColumn(
                name: "Fats",
                table: "MealIngredients");

            migrationBuilder.DropColumn(
                name: "MacroCalculationFailed",
                table: "MealIngredients");

            migrationBuilder.DropColumn(
                name: "MacroSource",
                table: "MealIngredients");

            migrationBuilder.DropColumn(
                name: "NutritionFoodId",
                table: "MealIngredients");

            migrationBuilder.DropColumn(
                name: "Proteins",
                table: "MealIngredients");
        }
    }
}
