using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMealOverride : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MealOverrides",
                columns: table => new
                {
                    MealOverrideId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduledMealId = table.Column<int>(type: "int", nullable: false),
                    ReplacementMealId = table.Column<int>(type: "int", nullable: true),
                    ActionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealOverrides", x => x.MealOverrideId);
                    table.ForeignKey(
                        name: "FK_MealOverrides_Meals_ReplacementMealId",
                        column: x => x.ReplacementMealId,
                        principalTable: "Meals",
                        principalColumn: "MealId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MealOverrides_ScheduledMeals_ScheduledMealId",
                        column: x => x.ScheduledMealId,
                        principalTable: "ScheduledMeals",
                        principalColumn: "ScheduledMealId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_MealOverrides_ReplacementMealId",
                table: "MealOverrides",
                column: "ReplacementMealId");

            migrationBuilder.CreateIndex(
                name: "IX_MealOverrides_ScheduledMealId",
                table: "MealOverrides",
                column: "ScheduledMealId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MealOverrides");
        }
    }
}
