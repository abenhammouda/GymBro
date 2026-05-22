using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNutritionGoalToAdherent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CaloriesDelta",
                table: "Adherents",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NutritionGoal",
                table: "Adherents",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaloriesDelta",
                table: "Adherents");

            migrationBuilder.DropColumn(
                name: "NutritionGoal",
                table: "Adherents");
        }
    }
}
