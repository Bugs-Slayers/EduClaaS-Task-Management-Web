import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "../EmptyState";
import { FolderOpen } from "lucide-react";

describe("EmptyState – rendering", () => {
  it("renders the title", () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No items found"
        description="Create one to get started"
      />,
    );
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No items"
        description="Nothing here yet"
      />,
    );
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("renders without an action button when action is not provided", () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="Empty"
        description="No data"
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders an action button when action is provided", () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="Empty"
        description="No data"
        action={{ label: "Create New", onClick: vi.fn() }}
      />,
    );
    expect(screen.getByRole("button", { name: "Create New" })).toBeInTheDocument();
  });
});

describe("EmptyState – interaction", () => {
  it("calls onClick when action button is clicked", async () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        icon={FolderOpen}
        title="Empty"
        description="No data"
        action={{ label: "Add Item", onClick: handleClick }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Add Item" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick only once per click", async () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        icon={FolderOpen}
        title="Empty"
        description="No data"
        action={{ label: "Click Me", onClick: handleClick }}
      />,
    );
    const btn = screen.getByRole("button", { name: "Click Me" });
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
