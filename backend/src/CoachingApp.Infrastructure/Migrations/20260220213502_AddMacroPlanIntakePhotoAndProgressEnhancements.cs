using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMacroPlanIntakePhotoAndProgressEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CoachClientId",
                table: "ProgressReports",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WeekNumber",
                table: "ProgressReports",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "CoachClients",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InactiveReason",
                table: "CoachClients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GoalType",
                table: "Adherents",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InitialWeight",
                table: "Adherents",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkNature",
                table: "Adherents",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "IntakePhotos",
                columns: table => new
                {
                    IntakePhotoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdherentId = table.Column<int>(type: "int", nullable: false),
                    PhotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhotoType = table.Column<int>(type: "int", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntakePhotos", x => x.IntakePhotoId);
                    table.ForeignKey(
                        name: "FK_IntakePhotos_Adherents_AdherentId",
                        column: x => x.AdherentId,
                        principalTable: "Adherents",
                        principalColumn: "AdherentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MacroPlans",
                columns: table => new
                {
                    MacroPlanId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CoachClientId = table.Column<int>(type: "int", nullable: false),
                    Calories = table.Column<int>(type: "int", nullable: false),
                    ProteinGrams = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    CarbsGrams = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    FatGrams = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MacroPlans", x => x.MacroPlanId);
                    table.ForeignKey(
                        name: "FK_MacroPlans_CoachClients_CoachClientId",
                        column: x => x.CoachClientId,
                        principalTable: "CoachClients",
                        principalColumn: "CoachClientId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProgressReports_CoachClientId",
                table: "ProgressReports",
                column: "CoachClientId");

            migrationBuilder.CreateIndex(
                name: "IX_IntakePhotos_AdherentId",
                table: "IntakePhotos",
                column: "AdherentId");

            migrationBuilder.CreateIndex(
                name: "IX_MacroPlans_CoachClientId",
                table: "MacroPlans",
                column: "CoachClientId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProgressReports_CoachClients_CoachClientId",
                table: "ProgressReports",
                column: "CoachClientId",
                principalTable: "CoachClients",
                principalColumn: "CoachClientId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProgressReports_CoachClients_CoachClientId",
                table: "ProgressReports");

            migrationBuilder.DropTable(
                name: "IntakePhotos");

            migrationBuilder.DropTable(
                name: "MacroPlans");

            migrationBuilder.DropIndex(
                name: "IX_ProgressReports_CoachClientId",
                table: "ProgressReports");

            migrationBuilder.DropColumn(
                name: "CoachClientId",
                table: "ProgressReports");

            migrationBuilder.DropColumn(
                name: "WeekNumber",
                table: "ProgressReports");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "CoachClients");

            migrationBuilder.DropColumn(
                name: "InactiveReason",
                table: "CoachClients");

            migrationBuilder.DropColumn(
                name: "GoalType",
                table: "Adherents");

            migrationBuilder.DropColumn(
                name: "InitialWeight",
                table: "Adherents");

            migrationBuilder.DropColumn(
                name: "WorkNature",
                table: "Adherents");
        }
    }
}
