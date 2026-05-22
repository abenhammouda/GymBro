using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoachingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplementGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupplementSetItems_SupplementSets_SupplementSetId",
                table: "SupplementSetItems");

            migrationBuilder.RenameColumn(
                name: "SupplementSetId",
                table: "SupplementSetItems",
                newName: "SupplementGroupId");

            migrationBuilder.RenameIndex(
                name: "IX_SupplementSetItems_SupplementSetId",
                table: "SupplementSetItems",
                newName: "IX_SupplementSetItems_SupplementGroupId");

            migrationBuilder.CreateTable(
                name: "SupplementGroups",
                columns: table => new
                {
                    SupplementGroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SupplementSetId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplementGroups", x => x.SupplementGroupId);
                    table.ForeignKey(
                        name: "FK_SupplementGroups_SupplementSets_SupplementSetId",
                        column: x => x.SupplementSetId,
                        principalTable: "SupplementSets",
                        principalColumn: "SupplementSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupplementGroups_SupplementSetId",
                table: "SupplementGroups",
                column: "SupplementSetId");

            // Clear orphaned items (old SupplementSetId values are now invalid SupplementGroupIds)
            migrationBuilder.Sql("DELETE FROM [SupplementSetItems]");

            migrationBuilder.AddForeignKey(
                name: "FK_SupplementSetItems_SupplementGroups_SupplementGroupId",
                table: "SupplementSetItems",
                column: "SupplementGroupId",
                principalTable: "SupplementGroups",
                principalColumn: "SupplementGroupId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupplementSetItems_SupplementGroups_SupplementGroupId",
                table: "SupplementSetItems");

            migrationBuilder.DropTable(
                name: "SupplementGroups");

            migrationBuilder.RenameColumn(
                name: "SupplementGroupId",
                table: "SupplementSetItems",
                newName: "SupplementSetId");

            migrationBuilder.RenameIndex(
                name: "IX_SupplementSetItems_SupplementGroupId",
                table: "SupplementSetItems",
                newName: "IX_SupplementSetItems_SupplementSetId");

            migrationBuilder.AddForeignKey(
                name: "FK_SupplementSetItems_SupplementSets_SupplementSetId",
                table: "SupplementSetItems",
                column: "SupplementSetId",
                principalTable: "SupplementSets",
                principalColumn: "SupplementSetId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
