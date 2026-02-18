using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMealTabsAndUpdateMeals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Meals_MealPlans_MealPlanId",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "MealTime",
                table: "Meals");

            migrationBuilder.RenameColumn(
                name: "MealType",
                table: "Meals",
                newName: "MealTabId");

            migrationBuilder.AlterColumn<int>(
                name: "MealPlanId",
                table: "Meals",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<decimal>(
                name: "CarbsGrams",
                table: "Meals",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Meals",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "FatGrams",
                table: "Meals",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageFileName",
                table: "Meals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Meals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Meals",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "ProteinGrams",
                table: "Meals",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Meals",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "MealTabs",
                columns: table => new
                {
                    MealTabId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CoachId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealTabs", x => x.MealTabId);
                    table.ForeignKey(
                        name: "FK_MealTabs_Coaches_CoachId",
                        column: x => x.CoachId,
                        principalTable: "Coaches",
                        principalColumn: "CoachId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Meals_MealTabId",
                table: "Meals",
                column: "MealTabId");

            migrationBuilder.CreateIndex(
                name: "IX_MealTabs_CoachId",
                table: "MealTabs",
                column: "CoachId");

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_MealPlans_MealPlanId",
                table: "Meals",
                column: "MealPlanId",
                principalTable: "MealPlans",
                principalColumn: "MealPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_MealTabs_MealTabId",
                table: "Meals",
                column: "MealTabId",
                principalTable: "MealTabs",
                principalColumn: "MealTabId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Meals_MealPlans_MealPlanId",
                table: "Meals");

            migrationBuilder.DropForeignKey(
                name: "FK_Meals_MealTabs_MealTabId",
                table: "Meals");

            migrationBuilder.DropTable(
                name: "MealTabs");

            migrationBuilder.DropIndex(
                name: "IX_Meals_MealTabId",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "CarbsGrams",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "FatGrams",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "ImageFileName",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "ProteinGrams",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Meals");

            migrationBuilder.RenameColumn(
                name: "MealTabId",
                table: "Meals",
                newName: "MealType");

            migrationBuilder.AlterColumn<int>(
                name: "MealPlanId",
                table: "Meals",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "Meals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "MealTime",
                table: "Meals",
                type: "time",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_MealPlans_MealPlanId",
                table: "Meals",
                column: "MealPlanId",
                principalTable: "MealPlans",
                principalColumn: "MealPlanId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
