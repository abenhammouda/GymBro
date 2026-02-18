using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkoutSessionsFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_ProgramDays_ProgramDayId",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "WorkoutSessions");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "WorkoutSessions",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "WorkoutSessions",
                newName: "VoiceMessageUrl");

            migrationBuilder.RenameColumn(
                name: "CompletedAt",
                table: "WorkoutSessions",
                newName: "StartDate");

            migrationBuilder.AlterColumn<int>(
                name: "ProgramDayId",
                table: "WorkoutSessions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "WorkoutSessions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CoachId",
                table: "WorkoutSessions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CoverImageFileName",
                table: "WorkoutSessions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverImageUrl",
                table: "WorkoutSessions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "WorkoutSessions",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "WorkoutSessions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "WorkoutSessions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "WorkoutSessions",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "VoiceMessageFileName",
                table: "WorkoutSessions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WorkoutSessionExercises",
                columns: table => new
                {
                    WorkoutSessionExerciseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkoutSessionId = table.Column<int>(type: "int", nullable: false),
                    ExerciseTemplateId = table.Column<int>(type: "int", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    Sets = table.Column<int>(type: "int", nullable: false),
                    Reps = table.Column<int>(type: "int", nullable: false),
                    RestSeconds = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutSessionExercises", x => x.WorkoutSessionExerciseId);
                    table.ForeignKey(
                        name: "FK_WorkoutSessionExercises_ExerciseTemplates_ExerciseTemplateId",
                        column: x => x.ExerciseTemplateId,
                        principalTable: "ExerciseTemplates",
                        principalColumn: "ExerciseTemplateId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkoutSessionExercises_WorkoutSessions_WorkoutSessionId",
                        column: x => x.WorkoutSessionId,
                        principalTable: "WorkoutSessions",
                        principalColumn: "WorkoutSessionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessions_CoachId",
                table: "WorkoutSessions",
                column: "CoachId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessionExercises_ExerciseTemplateId",
                table: "WorkoutSessionExercises",
                column: "ExerciseTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessionExercises_WorkoutSessionId",
                table: "WorkoutSessionExercises",
                column: "WorkoutSessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_Coaches_CoachId",
                table: "WorkoutSessions",
                column: "CoachId",
                principalTable: "Coaches",
                principalColumn: "CoachId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_ProgramDays_ProgramDayId",
                table: "WorkoutSessions",
                column: "ProgramDayId",
                principalTable: "ProgramDays",
                principalColumn: "ProgramDayId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_Coaches_CoachId",
                table: "WorkoutSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_ProgramDays_ProgramDayId",
                table: "WorkoutSessions");

            migrationBuilder.DropTable(
                name: "WorkoutSessionExercises");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutSessions_CoachId",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "CoachId",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "CoverImageFileName",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "CoverImageUrl",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "VoiceMessageFileName",
                table: "WorkoutSessions");

            migrationBuilder.RenameColumn(
                name: "VoiceMessageUrl",
                table: "WorkoutSessions",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "WorkoutSessions",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "WorkoutSessions",
                newName: "CompletedAt");

            migrationBuilder.AlterColumn<int>(
                name: "ProgramDayId",
                table: "WorkoutSessions",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "WorkoutSessions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_ProgramDays_ProgramDayId",
                table: "WorkoutSessions",
                column: "ProgramDayId",
                principalTable: "ProgramDays",
                principalColumn: "ProgramDayId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
