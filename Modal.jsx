import {
  cloneElement,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";

// Context used to share modal state between
// Modal, Modal.Open, and Modal.Window
const ModalContext = createContext();

function Modal({ children }) {
  // Stores the name of the currently open modal
  const [openName, setOpenName] = useState("");

  // Open a modal by its name
  const open = (name) => setOpenName(name);

  // Close the currently open modal
  const close = () => setOpenName("");

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

/*
 * Modal.Open
 *
 * Wraps any clickable element and injects
 * an onClick handler that opens the specified modal.
 *
 * Example:
 * <Modal.Open opens="create-cabin">
 *   <Button>Add Cabin</Button>
 * </Modal.Open>
 */
function Open({ children, opens }) {
  const { open } = useContext(ModalContext);

  return cloneElement(children, {
    onClick: () => open(opens),
  });
}

/*
 * Modal.Window
 *
 * Renders a modal window when its name matches
 * the currently active modal.
 *
 * Uses React Portal so the modal is rendered
 * outside the normal component hierarchy.
 */
function Window({
  children,
  name,
  className = "",
  overlayClassName = "",
}) {
  const { openName, close } = useContext(ModalContext);

  // Reference to the modal element
  const modalRef = useRef(null);

  // Close the modal when the user clicks outside it
  useEffect(() => {
    function handleClick(e) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick
      );
    };
  }, [close]);

  // Don't render if this modal isn't active
  if (name !== openName) return null;

  return createPortal(
    <div className={overlayClassName}>
      <div ref={modalRef} className={className}>
        {/* Modal close button */}
        <button
          onClick={close}
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          <HiXMark size={24} />
        </button>

        {/*
          Inject the close function into the child component.
          Useful when forms need to close the modal after submit.
        */}
        {cloneElement(children, {
          handleCloseModal: close,
        })}
      </div>
    </div>,
    document.body
  );
}

// Compound Component API
Modal.Open = Open;
Modal.Window = Window;

export default Modal;
