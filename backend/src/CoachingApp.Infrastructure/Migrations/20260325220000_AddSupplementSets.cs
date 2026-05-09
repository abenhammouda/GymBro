using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplementSets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove existing supplement-typed meal ingredients before dropping the column
            migrationBuilder.Sql("DELETE FROM MealIngredients WHERE [Type] = 'Complement'");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "MealIngredients");

            migrationBuilder.CreateTable(
                name: "SupplementSets",
                columns: table => new
                {
                    SupplementSetId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CoachId = table.Column<int>(type: "int", nullable: false),
                    Timing = table.Column<int>(type: "int", nullable: false),
                    Index = table.Column<int>(type: "int", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplementSets", x => x.SupplementSetId);
                    table.ForeignKey(
                        name: "FK_SupplementSets_Coaches_CoachId",
                        column: x => x.CoachId,
                        principalTable: "Coaches",
                        principalColumn: "CoachId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplementSetItems",
                columns: table => new
                {
                    SupplementSetItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SupplementSetId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(10,3)", precision: 10, scale: 3, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplementSetItems", x => x.SupplementSetItemId);
                    table.ForeignKey(
                        name: "FK_SupplementSetItems_SupplementSets_SupplementSetId",
                        column: x => x.SupplementSetId,
                        principalTable: "SupplementSets",
                        principalColumn: "SupplementSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupplementSets_CoachId_Timing_Index",
                table: "SupplementSets",
                columns: new[] { "CoachId", "Timing", "Index" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupplementSetItems_SupplementSetId",
                table: "SupplementSetItems",
                column: "SupplementSetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupplementSetItems");

            migrationBuilder.DropTable(
                name: "SupplementSets");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "MealIngredients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "Aliment");
        }
    }
}
