type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function Container({ className = "", children }: Props) {
  return (
    <div className={`mx-auto max-w-6xl px-4 ${className}`}>
      {children}
    </div>
  );
}

