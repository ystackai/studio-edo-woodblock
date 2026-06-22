"""
Compact v17 batch driver for 20 samurai assets.
Lists and filters IDs without Blender; imports the pilot only inside Blender.
"""
import argparse
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GAME_DIR = ROOT / "games" / "kawanakajima-foundry-samurai-proof"
OUT_BASE = GAME_DIR / "assets" / "generated" / "foundry" / "samurai-v17" / "full-20"
ALL_IDS = [(("takeda", f"takeda-{i:02d}", i - 1)) for i in range(1, 11)] + [
    ("uesugi", f"uesugi-{i:02d}", i - 1) for i in range(1, 11)
]


def script_args():
    argv = sys.argv
    if "--" in argv:
        return argv[argv.index("--") + 1 :]
    return argv[1:]


def parse_args():
    parser = argparse.ArgumentParser(description="Generate/list v17 samurai assets")
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--ids", default="")
    parser.add_argument("--start", type=int, default=None)
    parser.add_argument("--end", type=int, default=None)
    args, _unknown = parser.parse_known_args(script_args())
    return args


def select_ids(args):
    selected = list(ALL_IDS)
    if args.ids:
        wanted = {item.strip() for item in args.ids.split(",") if item.strip()}
        selected = [item for item in selected if item[1] in wanted]
    if args.start is not None:
        selected = selected[args.start :]
    if args.end is not None:
        selected = selected[: args.end]
    return selected


def print_plan(selected):
    print(f"Planned {len(selected)} samurai assets")
    print(f"Output root: {OUT_BASE}")
    print(f"{'ID':<12} {'Team':<8} {'Variant':<8} OutputDir")
    print("-" * 100)
    for team, asset_id, variant_idx in selected:
        print(f"{asset_id:<12} {team:<8} {variant_idx:<8} {OUT_BASE / asset_id}")


def load_pilot():
    pilot_path = Path(__file__).parent / "generate-pilot5-samurai.py"
    spec = importlib.util.spec_from_file_location("samurai_pilot5", str(pilot_path))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def build_one(pilot, team, asset_id, variant_idx):
    output_dir = OUT_BASE / asset_id
    output_dir.mkdir(parents=True, exist_ok=True)
    pilot.OUT_BASE = output_dir
    if hasattr(pilot, "SCREENSHOT_DIR"):
        pilot.SCREENSHOT_DIR = output_dir

    pilot.reset_for_new_samurai()
    mats = pilot.make_team_mats(team)
    mesh_count = pilot.build_samurai(variant_idx, asset_id, mats)
    print(f"[{asset_id}] mesh_count={mesh_count}")

    blend_path = output_dir / f"{asset_id}_source.blend"
    glb_path = output_dir / f"{asset_id}.glb"
    pilot.save_blend(blend_path)
    pilot.export_glb(glb_path)
    pilot.render_views(f"cam_{asset_id}")
    pilot.reset_for_new_samurai()


def main():
    args = parse_args()
    selected = select_ids(args)
    if args.list or args.dry_run:
        print_plan(selected)
        return 0

    try:
        import bpy  # noqa: F401
    except Exception as exc:
        print(f"Run in Blender for rendering, or use --list/--dry-run: {exc}", file=sys.stderr)
        return 2

    pilot = load_pilot()
    print_plan(selected)
    for team, asset_id, variant_idx in selected:
        print(f"\n=== Building {asset_id} ({team}, variant {variant_idx}) ===")
        build_one(pilot, team, asset_id, variant_idx)

    glb = len(list(OUT_BASE.glob("*/*.glb")))
    blend = len(list(OUT_BASE.glob("*/*.blend")))
    png = len(list(OUT_BASE.glob("*/*.png")))
    print(f"Batch evidence counts: glb={glb} blend={blend} png={png}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
