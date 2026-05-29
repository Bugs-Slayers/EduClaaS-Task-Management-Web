import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge – taskStatus", () => {
  it("renders TODO label for todo status", () => {
    render(<StatusBadge type="taskStatus" value="todo" />);
    expect(screen.getByText("TODO")).toBeInTheDocument();
  });

  it("renders IN PROGRESS label for in_progress status", () => {
    render(<StatusBadge type="taskStatus" value="in_progress" />);
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
  });

  it("renders REVIEW label for in_review status", () => {
    render(<StatusBadge type="taskStatus" value="in_review" />);
    expect(screen.getByText("REVIEW")).toBeInTheDocument();
  });

  it("renders DONE label for done status", () => {
    render(<StatusBadge type="taskStatus" value="done" />);
    expect(screen.getByText("DONE")).toBeInTheDocument();
  });

  it("renders BLOCKED label for blocked status", () => {
    render(<StatusBadge type="taskStatus" value="blocked" />);
    expect(screen.getByText("BLOCKED")).toBeInTheDocument();
  });
});

describe("StatusBadge – priority", () => {
  it("renders LOW for low priority", () => {
    render(<StatusBadge type="priority" value="low" />);
    expect(screen.getByText("LOW")).toBeInTheDocument();
  });

  it("renders MEDIUM for medium priority", () => {
    render(<StatusBadge type="priority" value="medium" />);
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
  });

  it("renders HIGH for high priority", () => {
    render(<StatusBadge type="priority" value="high" />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("renders CRITICAL for critical priority", () => {
    render(<StatusBadge type="priority" value="critical" />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });
});

describe("StatusBadge – projectStatus", () => {
  it("renders ACTIVE for active status", () => {
    render(<StatusBadge type="projectStatus" value="active" />);
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("renders COMPLETED for completed status", () => {
    render(<StatusBadge type="projectStatus" value="completed" />);
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("renders ARCHIVED for archived status", () => {
    render(<StatusBadge type="projectStatus" value="archived" />);
    expect(screen.getByText("ARCHIVED")).toBeInTheDocument();
  });
});

describe("StatusBadge – className prop", () => {
  it("applies extra className to the element", () => {
    const { container } = render(
      <StatusBadge type="taskStatus" value="done" className="extra-class" />,
    );
    expect(container.firstChild).toHaveClass("extra-class");
  });
});

describe("StatusBadge – renders as a span", () => {
  it("renders a span element", () => {
    const { container } = render(
      <StatusBadge type="taskStatus" value="todo" />,
    );
    expect(container.firstChild?.nodeName).toBe("SPAN");
  });
});
